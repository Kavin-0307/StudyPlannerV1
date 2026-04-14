package com.Ajwain.SOS.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.Ajwain.SOS.auth.CurrentUserService;
import com.Ajwain.SOS.config.PaginationConfig;
import com.Ajwain.SOS.dto.DeadlineRequestDTO;
import com.Ajwain.SOS.dto.DeadlineResponseDTO;
import com.Ajwain.SOS.dto.DeadlineSearchCriteria;
import com.Ajwain.SOS.dto.PaginationResponseDTO;
import com.Ajwain.SOS.entities.Deadline;
import com.Ajwain.SOS.entities.Subject;
import com.Ajwain.SOS.entities.User;
import com.Ajwain.SOS.entities.enums.DeadlineType;
import com.Ajwain.SOS.exception.BadRequestException;
import com.Ajwain.SOS.exception.ResourceNotFoundException;
import com.Ajwain.SOS.repositories.DeadlineRepository;
import com.Ajwain.SOS.repositories.SubjectRepository;
import com.Ajwain.SOS.specifications.DeadlineSpecification;

import jakarta.transaction.Transactional;

@Service
public class DeadlineService {
	private final SubjectRepository subjectRepository;
	private final DeadlineRepository deadlineRepository;
	private final CurrentUserService currentUserService;
	private final Logger logger=LoggerFactory.getLogger(StudyPlanService.class);
	
	private final StudyPlanService studyPlanService;
	public DeadlineService(SubjectRepository subjectRepository,DeadlineRepository deadlineRepository,StudyPlanService studyPlanService ,CurrentUserService currentUserService) {
		this.subjectRepository=subjectRepository;
		this.currentUserService=currentUserService;
		this.deadlineRepository=deadlineRepository;
		this.studyPlanService=studyPlanService;
	}
	public DeadlineResponseDTO createDeadline(long subjectId,DeadlineRequestDTO dto) {
		Deadline deadline =new Deadline();
		User user = currentUserService.getCurrentUser();

		Subject subject = subjectRepository.findById(subjectId)
		    .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));

		if (subject.getUser().getId()!=(user.getId())) {
		    throw new BadRequestException("Unauthorized access to subject");
		}
		if(dto.getDeadlineDate().isBefore(LocalDateTime.now())) {
		    throw new BadRequestException("Deadline cannot be in the past");
		}
		deadline.setDeadlineDate(dto.getDeadlineDate());
		deadline.setDeadlinePriority(dto.getDeadlinePriority());
		deadline.setDeadlineTitle(dto.getDeadlineTitle());
		deadline.setDeadlineType(dto.getDeadlineType());
		deadline.setSubject(subject);
		Deadline savedDeadline=deadlineRepository.save(deadline);
		studyPlanService.regenerateStudyPlan(user.getId());
		logger.info("Creating deadline for subject {}", subjectId);
		return convertToResponseDTO(savedDeadline);
	}
	public List<DeadlineResponseDTO> getDeadlinesByUser(){
	    User user = currentUserService.getCurrentUser();
	    return deadlineRepository.findBySubjectUser(user)
	            .stream().map(this::convertToResponseDTO).toList();
	}
	public List<DeadlineResponseDTO> getDeadlinesBySubject(long subjectId){
	    User user = currentUserService.getCurrentUser();

	    Subject subject = subjectRepository.findById(subjectId)
	        .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));

	    if (subject.getUser().getId()!=(user.getId())) {
	        throw new BadRequestException("Unauthorized access");
	    }

	    return deadlineRepository.findBySubject(user, subject)
	            .stream()
	            .map(this::convertToResponseDTO)
	            .toList();
	}
	public DeadlineResponseDTO updateDeadline(long deadlineID,DeadlineRequestDTO dto) {
		Deadline deadline=deadlineRepository.findById(deadlineID).orElseThrow(()->new ResourceNotFoundException("Deadline not found"));
		if(dto.getDeadlineDate().isBefore(LocalDateTime.now())) {
		    throw new BadRequestException( "Deadline cannot be in the past");
		}
		User user = currentUserService.getCurrentUser();

		if (deadline.getSubject().getUser().getId()!=(user.getId())) {
		    throw new BadRequestException("Unauthorized");
		}
		deadline.setDeadlineDate(dto.getDeadlineDate());
		deadline.setDeadlinePriority(dto.getDeadlinePriority());
		deadline.setDeadlineTitle(dto.getDeadlineTitle());
		deadline.setDeadlineType(dto.getDeadlineType());
		
		Deadline savedDeadline=deadlineRepository.save(deadline);
		studyPlanService.regenerateStudyPlan(user.getId());
		logger.info("Updating deadline {}", deadlineID);
		return convertToResponseDTO(savedDeadline);
	}
	@Transactional
	public void deleteDeadline(long deadlineId) {
	    Deadline deadline = deadlineRepository.findById(deadlineId)
	        .orElseThrow(() -> new ResourceNotFoundException("Deadline not found"));
	    User user = currentUserService.getCurrentUser();

	    if (deadline.getSubject().getUser().getId()!=(user.getId())) {
	        throw new BadRequestException("Unauthorized");
	    }
	    deadlineRepository.delete(deadline);
	    studyPlanService.regenerateStudyPlan(user.getId());
	    logger.info("Deleting deadline {}", deadlineId);
	}
	public List<DeadlineResponseDTO> getUpcomingDeadlines() {
	    User user = currentUserService.getCurrentUser();

	    return deadlineRepository
	        .findBySubjectUserAndDeadlineDateAfterOrderByDeadlineDateAsc(user, LocalDateTime.now())
	        .stream()
	        .map(this::convertToResponseDTO)
	        .toList();
	}
	public PaginationResponseDTO<DeadlineResponseDTO> getDeadlinesBySubject(long subjectId,Pageable pageable){
		if(pageable.getPageSize()>PaginationConfig.getMaxSize())
		{
			pageable=PageRequest.of(pageable.getPageNumber(),PaginationConfig.getMaxSize(),pageable.getSort());
		}
		Page<Deadline> deadline=deadlineRepository.findBySubjectId(subjectId, pageable);
		List<DeadlineResponseDTO> dtos=deadline.getContent().stream().map(this::convertToResponseDTO).toList();
		return PaginationResponseDTO.fromPage(deadline,dtos);
	}
	public PaginationResponseDTO<DeadlineResponseDTO> getDeadlinesByUser(Pageable pageable){
		pageable=validatePageable(pageable);

		User user = currentUserService.getCurrentUser();

		Page<Deadline> deadline = deadlineRepository.findBySubjectUser(user, pageable);
		List<DeadlineResponseDTO> dtos=deadline.getContent().stream().map(this::convertToResponseDTO).toList();
		return PaginationResponseDTO.fromPage(deadline,dtos);
	}
	public PaginationResponseDTO<DeadlineResponseDTO> getUpcomingDeadline(Pageable pageable){
		pageable=validatePageable(pageable);
		
		Page<Deadline> deadline=deadlineRepository.findByDeadlineDateAfter(LocalDateTime.now(),pageable);
		List<DeadlineResponseDTO> dtos=deadline.getContent().stream().map(this::convertToResponseDTO).toList();
		return PaginationResponseDTO.fromPage(deadline,dtos);
	}
	public PaginationResponseDTO<DeadlineResponseDTO> getOverdueDeadlines(Pageable pageable){
		pageable=validatePageable(pageable);
		Page<Deadline> deadline=deadlineRepository.findByDeadlineDateBefore(LocalDateTime.now(),pageable);
		List<DeadlineResponseDTO> dtos=deadline.getContent().stream().map(this::convertToResponseDTO).toList();
		return PaginationResponseDTO.fromPage(deadline,dtos);
	}
	public PaginationResponseDTO<DeadlineResponseDTO> getDeadlinesByType(DeadlineType type,Pageable pageable){
		pageable=validatePageable(pageable);
		Page<Deadline> deadline=deadlineRepository.findByType(type,pageable);
		List<DeadlineResponseDTO> dtos=deadline.getContent().stream().map(this::convertToResponseDTO).toList();
		return PaginationResponseDTO.fromPage(deadline,dtos);
	}
	public PaginationResponseDTO<DeadlineResponseDTO> getDeadlines(DeadlineSearchCriteria criteria,
	        Pageable pageable){
		pageable=validatePageable(pageable);
		User user=currentUserService.getCurrentUser();
		Specification<Deadline> s=buildSpecification(criteria).and(DeadlineSpecification.belongsToUser(user.getId()));
		Page<Deadline> deadline=deadlineRepository.findAll(s,pageable);
		List<DeadlineResponseDTO> dtos=deadline.getContent().stream().map(this::convertToResponseDTO).toList();
		return PaginationResponseDTO.fromPage(deadline, dtos);	

	}
	Specification<Deadline> buildSpecification(DeadlineSearchCriteria criteria){
		
	    return Specification.where(DeadlineSpecification.hasKeyword(criteria.getKeyword()))
	            .and(DeadlineSpecification.hasSubject(criteria.getSubjectId()))
	            .and(DeadlineSpecification.hasPriority(criteria.getDeadlinePriority()))
	            .and(DeadlineSpecification.deadlineAfter(criteria.getFromDate()))
	            .and(DeadlineSpecification.hasType(criteria.getDeadlineType()))
	            .and(DeadlineSpecification.deadlineBefore(criteria.getToDate()));
	
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

	private DeadlineResponseDTO convertToResponseDTO(Deadline deadline) {
		return new DeadlineResponseDTO(
				deadline.getId(),
				deadline.getDeadlineTitle(),
				deadline.getDeadlineDate(),
				deadline.getDeadlineType(),
				deadline.getDeadlinePriority()
				);
	}
}