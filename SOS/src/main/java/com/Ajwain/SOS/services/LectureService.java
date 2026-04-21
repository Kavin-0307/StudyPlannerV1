package com.Ajwain.SOS.services;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.Ajwain.SOS.auth.CurrentUserService;
import com.Ajwain.SOS.config.PaginationConfig;
import com.Ajwain.SOS.dto.LectureRequestDTO;
import com.Ajwain.SOS.dto.LectureResponseDTO;
import com.Ajwain.SOS.dto.LectureSearchCriteria;
import com.Ajwain.SOS.dto.PaginationResponseDTO;
import com.Ajwain.SOS.entities.Lecture;
import com.Ajwain.SOS.entities.Subject;
import com.Ajwain.SOS.entities.User;
import com.Ajwain.SOS.exception.ResourceNotFoundException;
import com.Ajwain.SOS.repositories.LectureRepository;
import com.Ajwain.SOS.repositories.SubjectRepository;
import com.Ajwain.SOS.specifications.LectureSpecification;
import com.Ajwain.SOS.storage.FileStorageService;

@Service
public class LectureService {
	private final LectureRepository lectureRepository;
	private final SubjectRepository subjectRepository;
	private final AIOutputService aiOutputService;
	private final FileStorageService fileStorageService;
	private final  CurrentUserService currentUserService;
	private final Logger logger=LoggerFactory.getLogger(LectureService.class);
	private final RevisionService revisionService;
	public LectureService(RevisionService revisionService,AIOutputService aiOutputService,LectureRepository lectureRepository,SubjectRepository subjectRepository,FileStorageService fileStorageService, CurrentUserService currentUserService)
	{
		this.currentUserService = currentUserService;
		this.revisionService=revisionService;
		this.aiOutputService=aiOutputService;
		this.fileStorageService=fileStorageService;
		this.lectureRepository=lectureRepository;
		this.subjectRepository=subjectRepository;
	}	
	// ============== CREATE LECTURE ==============
	public LectureResponseDTO createLecture(MultipartFile file,Long subjectId,LectureRequestDTO dto) {
		User user=currentUserService.getCurrentUser();
		Subject subject=subjectRepository.findById(subjectId).orElseThrow(()->new ResourceNotFoundException("Subject not found"));
		if (subject.getUser().getId()!=(user.getId())) {
            throw new ResourceNotFoundException("Unauthorized");
        }

		Lecture lecture=new Lecture();
		lecture.setSubject(subject);
		Path path;
		try {
		path=fileStorageService.saveUploadedFile(file, subjectId) ;
		}
		catch(IOException e) {
			throw new RuntimeException("File not saved");
		}
		lecture.setProcessed(false);
		lecture.setFilePath(path.toString());
		lecture.setUploadDate(LocalDate.now());
		Lecture savedLecture=lectureRepository.save(lecture);
		logger.info("Lecture uploaded for subject {}", user.getUserEmail());

		return convertToResponseDTO(savedLecture);
	}
	
	// ============== PROCESSING THE LECTURE ==============
	public LectureResponseDTO markProcessed(Long lectureId, String extractedText)  {
		User user=currentUserService.getCurrentUser();

	    Lecture lecture = lectureRepository.findById(lectureId).orElseThrow(() -> new ResourceNotFoundException( "Lecture not found"));
	    if (lecture.getSubject().getUser().getId()!=(user.getId())) {
            throw new ResourceNotFoundException("Unauthorized");
        }
	    try {
	    lecture.setFilePath(fileStorageService.moveToProcessed(Paths.get(lecture.getFilePath())).toString());
	    }catch(IOException e) {
			throw new RuntimeException("File not saved");
		}
	    lecture.setLectureText(extractedText);
	    lecture.setProcessed(true);
	    logger.info("Lecture processed {}", lectureId);

	    return convertToResponseDTO(lectureRepository.save(lecture));
	}
	public LectureResponseDTO processLecture(long lectureId) {
		Lecture lecture=lectureRepository.findById(lectureId).orElseThrow(()->new ResourceNotFoundException("Lecture not found"));
		User user = currentUserService.getCurrentUser();

		if (lecture.getSubject().getUser().getId()!=(user.getId())) {
		    throw new ResourceNotFoundException("Unauthorized");
		}
		String filePath=lecture.getFilePath();
		String extractedText="";
		try {
			extractedText = PdfExtractionService.extractText(filePath);
		} catch (Exception e) {
			
			e.printStackTrace();
		}

		aiOutputService.generateAIOutputsForLecture(lecture, extractedText);
		revisionService.createRevisionSchedule(lecture);

		return markProcessed(lectureId,extractedText);
	}
	// ============== DELETE ==============
	public void deleteLecture(long lectureId) {
			User user=currentUserService.getCurrentUser();

		    Lecture lecture= lectureRepository.findById(lectureId).orElseThrow(() -> new ResourceNotFoundException("Lecture not found"));
		    if (lecture.getSubject().getUser().getId()!=(user.getId())) {
	            throw new ResourceNotFoundException("Unauthorized");
	        }
		    fileStorageService.deleteFile(lecture.getFilePath());
			   
		    lectureRepository.delete(lecture);
		    logger.info("Lecture uploaded for subject {}", lectureId);
	
		
	}
	// ============== SINGLE FETCH ==============
	public LectureResponseDTO getLectureById(Long lectureId) {
		User user=currentUserService.getCurrentUser();

	    Lecture lecture = lectureRepository.findById(lectureId).orElseThrow(() -> new ResourceNotFoundException( "Lecture not found"));
	    if (lecture.getSubject().getUser().getId()!=(user.getId())) {
            throw new ResourceNotFoundException("Unauthorized");
	    }
	    return convertToResponseDTO(lecture);
	}
	// ============== BASIC LISTS ==============
	public List<LectureResponseDTO> getLecturesBySubject(long subjectId){
		User user=currentUserService.getCurrentUser();
		Subject subject = subjectRepository.findById(subjectId).orElseThrow(() -> new ResourceNotFoundException("Subject not found"));

        if (subject.getUser().getId()!=(user.getId())) {
            throw new ResourceNotFoundException("Unauthorized");
        }
		return lectureRepository.findBySubjectId(subjectId).stream().map(this::convertToResponseDTO).toList();
	}
	public List<LectureResponseDTO> getProcessedLectures(Long subjectId) {
	    User user = currentUserService.getCurrentUser();

	    Subject subject = subjectRepository.findById(subjectId)
	        .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));

	    if (subject.getUser().getId()!=(user.getId())) { 
	        throw new ResourceNotFoundException("Unauthorized");
	    }

	    return lectureRepository
	            .findBySubjectIdAndProcessedTrue(subjectId)
	            .stream()
	            .map(this::convertToResponseDTO)
	            .toList();
	}
	@Cacheable(
			  value = "lectures",
			  key = "#root.target.currentUserService.getCurrentUser().id + '_pending'"
			)
	public List<LectureResponseDTO> getPendingLecturesByUser() {

        User user=currentUserService.getCurrentUser();
        return lectureRepository.findBySubject_UserAndProcessedFalse(user)
                .stream()
                .map(this::convertToResponseDTO)
                .toList();
	}
	
	// ============== PAGINATION ==============
	public PaginationResponseDTO<LectureResponseDTO> getLecturesBySubject(
            long subjectId, Pageable pageable) {
		User user = currentUserService.getCurrentUser();
        Subject subject = subjectRepository.findById(subjectId).orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
        if (subject.getUser().getId()!=(user.getId())) {
            throw new ResourceNotFoundException("Unauthorized");
        }
        pageable=validatePageable(pageable);
        Page<Lecture> lectures = lectureRepository.findBySubject(subject, pageable);
        List<LectureResponseDTO> dtos =lectures.getContent().stream().map(this::convertToResponseDTO).toList();

        return PaginationResponseDTO.fromPage(lectures, dtos);
    }
	
	
	public PaginationResponseDTO<LectureResponseDTO> getProcessedLectures(Pageable pageable){
		pageable=validatePageable(pageable);
		User user=currentUserService.getCurrentUser();
		Page<Lecture> lectures=lectureRepository.findBySubject_UserAndProcessed(user,true, pageable);
		List<LectureResponseDTO> dtos=lectures.getContent().stream().map(this::convertToResponseDTO).toList();
		return PaginationResponseDTO.fromPage(lectures,dtos);
	}	
	
	public PaginationResponseDTO<LectureResponseDTO> getUnprocessedLectures(Pageable pageable){
		pageable=validatePageable(pageable);
		User user = currentUserService.getCurrentUser();

		Page<Lecture> lectures =lectureRepository.findBySubject_UserAndProcessed(user, false, pageable);
		List<LectureResponseDTO> dtos=lectures.getContent().stream().map(this::convertToResponseDTO).toList();
		return PaginationResponseDTO.fromPage(lectures,dtos);
	}
	// ============== SEARCH ==============
	
	public PaginationResponseDTO<LectureResponseDTO> getLectures(LectureSearchCriteria criteria,Pageable pageable){
		pageable=validatePageable(pageable);
		User user = currentUserService.getCurrentUser();

		Specification<Lecture> s =buildSpecification(criteria).and(LectureSpecification.belongsToUser(user.getId()));
		Page<Lecture> lecture=lectureRepository.findAll(s,pageable);
		List<LectureResponseDTO> dtos=lecture.getContent().stream().map(this::convertToResponseDTO).toList();
		return PaginationResponseDTO.fromPage(lecture, dtos);	
	}

	Specification<Lecture> buildSpecification(LectureSearchCriteria criteria){
		
		    return Specification.where(LectureSpecification.hasKeyword(criteria.getKeyword()))
		            .and(LectureSpecification.hasSubject(criteria.getSubjectId()))
		            .and(LectureSpecification.isProcessed(criteria.getProcessed()))
		            .and(LectureSpecification.uploadDateAfter(criteria.getFromDate()))
		            .and(LectureSpecification.uploadDateBefore(criteria.getToDate()));
		
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

	private LectureResponseDTO convertToResponseDTO(Lecture lecture) {
		return new LectureResponseDTO(lecture.getId(),lecture.getSubject().getId(),lecture.getFilePath(),lecture.getProcessed(),lecture.getUploadDate(),lecture.getLectureText());
	}
}
