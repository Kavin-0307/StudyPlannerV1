package com.Ajwain.SOS.services;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.Ajwain.SOS.auth.CurrentUserService;
import com.Ajwain.SOS.config.PaginationConfig;
import com.Ajwain.SOS.dto.PaginationResponseDTO;
import com.Ajwain.SOS.dto.RevisionResponseDTO;
import com.Ajwain.SOS.dto.RevisionSearchCriteria;
import com.Ajwain.SOS.entities.Lecture;
import com.Ajwain.SOS.entities.Revision;
import com.Ajwain.SOS.entities.User;
import com.Ajwain.SOS.entities.enums.RevisionStatus;
import com.Ajwain.SOS.exception.ResourceNotFoundException;
import com.Ajwain.SOS.repositories.RevisionRepository;
import com.Ajwain.SOS.specifications.RevisionSpecification;

@Service
public class RevisionService {
	private final RevisionRepository revisionRepository;
	private final CurrentUserService currentUserService;
	public RevisionService(RevisionRepository revisionRepository,CurrentUserService currentUserService) {
		this.revisionRepository=revisionRepository;
		this.currentUserService = currentUserService;
	}
	public void createRevisionSchedule(Lecture lecture) {
		LocalDate processedDate=lecture.getUploadDate();
		List<Revision> revisionSchedule=new ArrayList<>() ;
		int count=1;
		int arr[]= {1,3,7,14,30};
		for(int n:arr) {
			LocalDate revisionDate=processedDate.plusDays(n);
			Revision revision=new Revision();
			revision.setLecture(lecture);
			revision.setRevisionDate(revisionDate);
			revision.setRevisionNumber(count);
			count++;
			revision.setCompleted(RevisionStatus.PENDING);
			revisionSchedule.add(revision);
		}
		revisionRepository.saveAll(revisionSchedule);
		
	}
	
	public RevisionResponseDTO markRevisionCompleted(Long revisionId) {
		 User user = currentUserService.getCurrentUser(); 
		Revision revision=revisionRepository.findById(revisionId).orElseThrow(()->new ResourceNotFoundException("Revision not found"));
		 if (revision.getLecture().getSubject().getUser().getId()!=(user.getId())) {
	            throw new ResourceNotFoundException("Unauthorized");
	        }
		revision.setCompleted(RevisionStatus.COMPLETED);
		revisionRepository.save(revision);
		return convertToResponseDTO(revision);
	}
	
	public PaginationResponseDTO<RevisionResponseDTO> getRevisionsByUser(Pageable pageable){
		User user = currentUserService.getCurrentUser(); 
		pageable = validatePageable(pageable);
		Page<Revision> revision=revisionRepository.findByLectureSubjectUserId(user, pageable);
		List<RevisionResponseDTO> dtos=revision.getContent().stream().map(this::convertToResponseDTO).toList();
		return PaginationResponseDTO.fromPage(revision, dtos);
	}
	public PaginationResponseDTO<RevisionResponseDTO> getDueRevisions(long userId,Pageable pageable){
		User user = currentUserService.getCurrentUser();
		pageable = validatePageable(pageable);
		Page<Revision> revision =
			    revisionRepository.findByLectureSubjectUserAndRevisionDateLessThanEqual(
			        user, LocalDate.now(), pageable
			    );		List<RevisionResponseDTO> dtos=revision.getContent().stream().map(this::convertToResponseDTO).toList();
		return PaginationResponseDTO.fromPage(revision, dtos);
	}
	public PaginationResponseDTO<RevisionResponseDTO> getRevisionsForLecture(long lectureId,Pageable pageable){
		pageable = validatePageable(pageable);
		 User user = currentUserService.getCurrentUser(); 
		Page<Revision> revision=revisionRepository.findByLectureId(lectureId, pageable);
		 revision.getContent().forEach(r -> {
	            if (r.getLecture().getSubject().getUser().getId()!=(user.getId())) {
	                throw new ResourceNotFoundException("Unauthorized");
	            }
	        });

		List<RevisionResponseDTO> dtos=revision.getContent().stream().map(this::convertToResponseDTO).toList();
		return PaginationResponseDTO.fromPage(revision, dtos);
	}
	
	
	public PaginationResponseDTO<RevisionResponseDTO> getCompletedRevisions(Pageable pageable){
		pageable = validatePageable(pageable);
        User user = currentUserService.getCurrentUser(); 

		Page<Revision> revision=revisionRepository.findByLectureSubjectUserAndStatus(user,RevisionStatus.COMPLETED, pageable);
		List<RevisionResponseDTO> dtos=revision.getContent().stream().map(this::convertToResponseDTO).toList();
		return PaginationResponseDTO.fromPage(revision, dtos);
	}
	
	
	public PaginationResponseDTO<RevisionResponseDTO> getPendingRevisions(Pageable pageable){
        User user = currentUserService.getCurrentUser(); 

		pageable = validatePageable(pageable);
		Page<Revision> revision=revisionRepository.findByLectureSubjectUserAndStatus(user,RevisionStatus.PENDING, pageable);
		List<RevisionResponseDTO> dtos=revision.getContent().stream().map(this::convertToResponseDTO).toList();
		return PaginationResponseDTO.fromPage(revision, dtos);
	}
	public PaginationResponseDTO<RevisionResponseDTO> getRevisions(RevisionSearchCriteria criteria,Pageable pageable){
		pageable=validatePageable(pageable);
        User user = currentUserService.getCurrentUser(); 

		Specification<Revision> s=buildSpecification(criteria).and(RevisionSpecification.hasUser(user.getId()));
		Page<Revision> revision=revisionRepository.findAll(s,pageable);
		List<RevisionResponseDTO> dtos=revision.getContent().stream().map(this::convertToResponseDTO).toList();
		return PaginationResponseDTO.fromPage(revision, dtos);	

	}
	Specification<Revision> buildSpecification(RevisionSearchCriteria criteria){
	    return Specification.where(RevisionSpecification.hasUser(criteria.getUserId()))
	            .and(RevisionSpecification.hasLecture(criteria.getLectureId()))
	            .and(RevisionSpecification.hasStatus(criteria.getRevisionStatus()))
	            .and(RevisionSpecification.hasRevisionNumber(criteria.getRevisionNumber()))
	            .and(RevisionSpecification.revisionAfter(criteria.getFromDate()))
	            .and(RevisionSpecification.revisionBefore(criteria.getToDate()));
	}
	private RevisionResponseDTO convertToResponseDTO(Revision revision) {
	    return new RevisionResponseDTO(
	            revision.getId(),
	            revision.getLecture().getId(),
	            revision.getLecture().getSubject().getId(),
	            revision.getRevisionDate(),
	            revision.getRevisionNumber(),
	            revision.getCompleted()
	    );
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
