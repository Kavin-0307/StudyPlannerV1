 package com.Ajwain.SOS.services;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.Ajwain.SOS.auth.CurrentUserService;
import com.Ajwain.SOS.config.PaginationConfig;
import com.Ajwain.SOS.dto.PaginationResponseDTO;
import com.Ajwain.SOS.dto.StudyPlanResponseDTO;
import com.Ajwain.SOS.dto.StudyPlanSearchCriteria;
import com.Ajwain.SOS.entities.Deadline;
import com.Ajwain.SOS.repositories.DeadlineRepository;
import com.Ajwain.SOS.repositories.StudyPlanRepository;
import com.Ajwain.SOS.specifications.StudyPlanSpecification;

import jakarta.transaction.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.Ajwain.SOS.entities.StudyPlan;
import com.Ajwain.SOS.entities.User;
import com.Ajwain.SOS.entities.enums.DeadlineType;
import com.Ajwain.SOS.entities.enums.StudyStatus;
import com.Ajwain.SOS.exception.ResourceNotFoundException;
@Service
public class StudyPlanService {
	private final StudyPlanRepository studyPlanRepository;
	private final Logger logger=LoggerFactory.getLogger(StudyPlanService.class);
	private final DeadlineRepository deadlineRepository;
	private final CurrentUserService currentUserService;
	public StudyPlanService(StudyPlanRepository studyPlanRepository,DeadlineRepository deadlineRepository,CurrentUserService currentUserService) {
		this.studyPlanRepository=studyPlanRepository;
		this.currentUserService=currentUserService;
		this.deadlineRepository=deadlineRepository;
	}
	@Transactional
	public List<StudyPlanResponseDTO> generateStudyPlan(){
		 User user = currentUserService.getCurrentUser(); 
	        long userId = user.getId();
		int MIN_SESSION=20;
		studyPlanRepository.deleteByUserId(userId);
		List<Deadline> deadlines=deadlineRepository.findUpcomingDeadlinesWithPriority(user);
		Map<LocalDate,List<StudyPlan>> schedule=new HashMap<>();
		int DAILY_LIMIT=180;
		LocalDate today=LocalDate.now();
		logger.info("Generating study plan for user {}", userId);
		for(Deadline d:deadlines) {
			long workload=0;
			if(d.getDeadlineType()==DeadlineType.EXAM)
				workload+=600;
			else if(d.getDeadlineType()==DeadlineType.ASSIGNMENT)
				workload+=240;
			else
				workload+=180;
			long diffInDays=ChronoUnit.DAYS.between(today,d.getDeadlineDate());
			if(diffInDays<=0)
				diffInDays=1;
			double urgency=1.0/diffInDays;
			long dailyMinutes=Math.max(20,(long)(workload*urgency));
			double weight=0.0;
			if(d.getDeadlinePriority()==1)
				weight=1.5;
			else if(d.getDeadlinePriority()==2)
			weight=1.3;
			else if(d.getDeadlinePriority()==3)
				weight=1;
			else if(d.getDeadlinePriority()==4)
				weight=0.8;
			else
				weight=0.5;
			long adjustedMinutes=(long)(dailyMinutes*weight);
			
			for(int i=0;i<diffInDays;i++) {
				double progressionFactor=1+((double)i/diffInDays);
				int duration=(int)(adjustedMinutes*progressionFactor);
				StudyPlan plan=new StudyPlan();
				plan.setUser(user);
				plan.setDurationMinutes(duration);
				plan.setStudyDate(today.plusDays(i));
				plan.setSubject(d.getSubject());
				plan.setStudyStatus(StudyStatus.PLANNED);
				schedule.computeIfAbsent(today.plusDays(i), k -> new ArrayList<>()).add(plan);
			}
		}
		List<StudyPlan> finalPlans=new ArrayList<>();
		for(Map.Entry<LocalDate,List<StudyPlan>> entry:schedule.entrySet()) {
			Map<Long,Integer> subjectLoad=new HashMap<>();
			List<StudyPlan> dayPlans=entry.getValue();
			int total=dayPlans.stream().mapToInt(StudyPlan::getDurationMinutes).sum();
			dayPlans.sort((a,b)->b.getDurationMinutes()-a.getDurationMinutes());

			if(total>DAILY_LIMIT) {
				double scale=(double)DAILY_LIMIT/total;
				
				for(StudyPlan p:dayPlans) {
					int newDuration=(int)(p.getDurationMinutes()*scale);
					if(newDuration<MIN_SESSION)
						continue;
					long subjectId=p.getSubject().getId();
					int currentLoad=subjectLoad.getOrDefault(subjectId, 0);
					if(currentLoad>90) {
						newDuration=(int)(newDuration*0.7);
					}
					if(newDuration<MIN_SESSION)continue;
					p.setDurationMinutes(newDuration);
					subjectLoad.put(subjectId, currentLoad+newDuration);
					finalPlans.add(p);
				}
				
			}
			else {
				
				for(StudyPlan p:dayPlans) {
					int duration=p.getDurationMinutes();
					if(duration<MIN_SESSION)continue;
					long subjectId=p.getSubject().getId();
					int currentLoad=subjectLoad.getOrDefault(subjectId, 0);
					if(currentLoad>90) {
						duration=(int)(duration*0.7);
					}
					if(duration<MIN_SESSION)continue;
					p.setDurationMinutes(duration);
					subjectLoad.put(subjectId, currentLoad+duration);
					finalPlans.add(p);
				}
			}
		
		}
		
		studyPlanRepository.saveAll(finalPlans);
		
		return finalPlans.stream().map(this::convertToResponseDTO).toList();
	}
	public StudyPlanResponseDTO updateStudyStatus(Long planId, StudyStatus status) {

	    StudyPlan plan = studyPlanRepository.findById(planId)
	        .orElseThrow(() -> new ResourceNotFoundException("Study plan not found"
	        ));
	    User user=currentUserService.getCurrentUser();
	    if(!plan.getUser().equals(user))
	    	throw new ResourceNotFoundException("Unauthorized");
	    	
	    if(status == StudyStatus.MISSED) {
	        regenerateStudyPlan();
	    }
	    plan.setStudyStatus(status);

	    studyPlanRepository.save(plan);

	    return convertToResponseDTO(plan);
	}
	public List<StudyPlanResponseDTO> getTodayPlan(){
		User user=currentUserService.getCurrentUser();
		return studyPlanRepository.findTodayPlanWithRelations(user.getId(), LocalDate.now()).stream().map(this::convertToResponseDTO).toList();
	}
	public List<StudyPlanResponseDTO> getStudyPlanByUser() {
		 User user = currentUserService.getCurrentUser(); // ✅ FIX
		 List<StudyPlan> plans = studyPlanRepository.findFullPlanWithRelations(user.getId());
		 if (plans.isEmpty()) {
		        throw new ResourceNotFoundException("The study plan was not found");
		    }

		 return plans.stream().map(this::convertToResponseDTO).toList();
		
	}
	public List<StudyPlanResponseDTO> regenerateStudyPlan() {
	    return generateStudyPlan();
	}
	public List<StudyPlanResponseDTO> getPlanByDateRange(LocalDate start, LocalDate end) {
	    User user = currentUserService.getCurrentUser();
	    return studyPlanRepository.findPlanInRangeWithRelations(user.getId(), start, end).stream().map(this::convertToResponseDTO).toList();
	}
	public Map<String,Long> getProgress(){
		 User user = currentUserService.getCurrentUser();
		 
		List<StudyPlan> plans=studyPlanRepository.findByUserId(user.getId());
		long completed=plans.stream().filter(p->p.getStudyStatus()==StudyStatus.COMPLETED).count();
		long pending=plans.stream().filter(p->p.getStudyStatus()==StudyStatus.PLANNED).count();
		Map<String,Long> result=new HashMap<>();
		result.put("completed",completed);
		result.put("pending",pending);
		return result;
	}
	private StudyPlanResponseDTO convertToResponseDTO(StudyPlan studyPlan) {
		return new StudyPlanResponseDTO(studyPlan.getId(),
				studyPlan.getUser().getId(),
				studyPlan.getSubject().getId(),
				studyPlan.getStudyDate(),
				studyPlan.getDurationMinutes(),
				studyPlan.getStudyStatus());
	}
	public PaginationResponseDTO<StudyPlanResponseDTO> getStudyPlans(Pageable pageable) {

	    User user = currentUserService.getCurrentUser();
	    pageable = validatePageable(pageable);
	    Page<StudyPlan> page=studyPlanRepository.findByUserId(user.getId(), pageable);
	    List<StudyPlanResponseDTO> dtos =
	            page.getContent().stream().map(this::convertToResponseDTO).toList();

	    return PaginationResponseDTO.fromPage(page, dtos);
	}
	public PaginationResponseDTO<StudyPlanResponseDTO> getTodayPlan(Pageable pageable) {
	    User user = currentUserService.getCurrentUser(); 
	    pageable = validatePageable(pageable);
	    Page<StudyPlan> page =studyPlanRepository.findByUserIdAndStudyDate(user.getId(), LocalDate.now(), pageable);

	    List<StudyPlanResponseDTO> dtos =page.getContent().stream().map(this::convertToResponseDTO).toList();
	    return PaginationResponseDTO.fromPage(page, dtos);
	 
	}
	public PaginationResponseDTO<StudyPlanResponseDTO> getCompletedPlans(Pageable pageable) {

	    User user = currentUserService.getCurrentUser(); 
	    pageable = validatePageable(pageable);
	    Page<StudyPlan> page =studyPlanRepository.findByUserIdAndStudyStatus(user.getId(), StudyStatus.COMPLETED, pageable);
	    List<StudyPlanResponseDTO> dtos =page.getContent().stream().map(this::convertToResponseDTO).toList();
	    return PaginationResponseDTO.fromPage(page, dtos);
	}
	public PaginationResponseDTO<StudyPlanResponseDTO> getPendingPlans(Pageable pageable) {

	    User user = currentUserService.getCurrentUser(); 
	    pageable = validatePageable(pageable);
	    Page<StudyPlan> page =studyPlanRepository.findByUserIdAndStudyStatus(user.getId(), StudyStatus.PLANNED, pageable);
	    List<StudyPlanResponseDTO> dtos =page.getContent().stream().map(this::convertToResponseDTO).toList();
	    return PaginationResponseDTO.fromPage(page, dtos);
	}
	public PaginationResponseDTO<StudyPlanResponseDTO> getPlanByDateRange(LocalDate start, LocalDate end, Pageable pageable) {

	    User user = currentUserService.getCurrentUser(); // ✅ FIX

	    pageable = validatePageable(pageable);

	    Page<StudyPlan> page =
	            studyPlanRepository.findByUserIdAndStudyDateBetween(user.getId(), start, end, pageable);
	    List<StudyPlanResponseDTO> dtos =page.getContent().stream().map(this::convertToResponseDTO).toList();
	    return PaginationResponseDTO.fromPage(page, dtos);
	}
	public PaginationResponseDTO<StudyPlanResponseDTO> getStudyPlans(StudyPlanSearchCriteria criteria, Pageable pageable) {

	    User user = currentUserService.getCurrentUser(); 
	    pageable = validatePageable(pageable);
	    Specification<StudyPlan> spec =buildSpecification(criteria).and(StudyPlanSpecification.hasUser(user.getId()));
	    Page<StudyPlan> plans = studyPlanRepository.findAll(spec, pageable);

	    List<StudyPlanResponseDTO> dtos =
	            plans.getContent().stream().map(this::convertToResponseDTO).toList();

	    return PaginationResponseDTO.fromPage(plans, dtos);
	}
	Specification<StudyPlan> buildSpecification(StudyPlanSearchCriteria criteria){
	    return Specification.where(StudyPlanSpecification.hasUser(criteria.getUserId()))
	            .and(StudyPlanSpecification.hasSubject(criteria.getSubjectId()))
	            .and(StudyPlanSpecification.hasStatus(criteria.getStatus()))
	            .and(StudyPlanSpecification.studyDateAfter(criteria.getFromDate()))
	            .and(StudyPlanSpecification.studyDateBefore(criteria.getToDate()))
	            .and(StudyPlanSpecification.durationGreaterThan(criteria.getMinDuration()))
	            .and(StudyPlanSpecification.durationLessThan(criteria.getMaxDuration()));
	}
	private Pageable validatePageable(Pageable pageable) {
	    if (pageable.getPageSize() > PaginationConfig.getMaxSize()) {
	        return PageRequest.of(
	            pageable.getPageNumber(),
	            PaginationConfig.getMaxSize(),
	            pageable.getSort()
	        );
	    }
	    return pageable;
	}
}
