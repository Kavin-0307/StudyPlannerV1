package com.Ajwain.SOS.services;

import java.util.List;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.Ajwain.SOS.auth.CurrentUserService;
import com.Ajwain.SOS.config.PaginationConfig;
import com.Ajwain.SOS.dto.PaginationResponseDTO;
import com.Ajwain.SOS.dto.SubjectRequestDTO;
import com.Ajwain.SOS.dto.SubjectResponseDTO;
import com.Ajwain.SOS.entities.Subject;
import com.Ajwain.SOS.entities.User;
import com.Ajwain.SOS.exception.BadRequestException;
import com.Ajwain.SOS.exception.ResourceNotFoundException;
import com.Ajwain.SOS.repositories.SubjectRepository;
import com.Ajwain.SOS.repositories.UserRepository;

@Service
public class SubjectService {
    private final Logger logger = LoggerFactory.getLogger(SubjectService.class);
    private final SubjectRepository subjectRepository;
    private final CurrentUserService currentUserService;

    public SubjectService(SubjectRepository subjectRepository, UserRepository userRepository,
            CurrentUserService currentUserService) {
        this.subjectRepository = subjectRepository;
        this.currentUserService = currentUserService;
    }
    @CacheEvict(value={"subjects","studyplan","dashboard"},allEntries=true)
    public SubjectResponseDTO createSubject(SubjectRequestDTO dto) {
        User user = currentUserService.getCurrentUser();
        long userId = user.getId();

        if (subjectRepository.existsByUserIdAndSubjectName(userId, dto.getSubjectName())) {
            throw new BadRequestException("Subject already exists");
        }

        Subject subject = new Subject();
        subject.setSubjectName(dto.getSubjectName());
        subject.setSubjectPriority(dto.getSubjectPriority());
        subject.setSubjectTag(dto.getSubjectTag());
        subject.setUser(user);

        Subject savedSubject = subjectRepository.save(subject);
        logger.info("Subject created for user {}", userId);
        return convertToResponseDTO(savedSubject);
    }
    @CacheEvict(value={"subjects","studyplan","dashboard"},allEntries=true)

    public SubjectResponseDTO updateSubject(long subjectId, SubjectRequestDTO dto) {
        long currentUserId = currentUserService.getCurrentUserId();
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));

        if (subject.getUser().getId() != currentUserId) {
            throw new BadRequestException("You do not have permission to update this subject");
        }

        subject.setSubjectName(dto.getSubjectName());
        subject.setSubjectPriority(dto.getSubjectPriority());
        subject.setSubjectTag(dto.getSubjectTag());

        Subject savedSubject = subjectRepository.save(subject);
        logger.info("Subject {} updated", subjectId);
        return convertToResponseDTO(savedSubject);
    }
    @Cacheable(value="subjects",key="#root.target.currentUserService.getCurrentUserId()+'_'+#pageable.pageNumber+'_'+#pageable.pageSize+'_'+#pageable.sort")
    public PaginationResponseDTO<SubjectResponseDTO> getSubjects(Pageable pageable) {
        long userId = currentUserService.getCurrentUserId();
        pageable = validatePageable(pageable);
        Page<Subject> subjects = subjectRepository.findByUserId(userId, pageable);
        List<SubjectResponseDTO> dtos = subjects.getContent().stream().map(this::convertToResponseDTO).toList();
        return PaginationResponseDTO.fromPage(subjects, dtos);
    }
    @CacheEvict(value={"subjects","studyplan","dashboard"},allEntries=true)

    public void deleteSubject(long subjectId) {
        long currentUserId = currentUserService.getCurrentUserId();
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));

        if (subject.getUser().getId() != currentUserId) {
            throw new BadRequestException("You do not have permission to delete this subject");
        }

        subjectRepository.delete(subject);
        logger.info("Subject {} deleted", subjectId);
    }

    public PaginationResponseDTO<SubjectResponseDTO> searchSubjects(String keyword, Pageable pageable) {
        long userId = currentUserService.getCurrentUserId();
        pageable = validatePageable(pageable);

        Page<Subject> subjectPage;
        if (keyword == null || keyword.isBlank()) {
            subjectPage = subjectRepository.findByUserId(userId, pageable);
        } else {
            subjectPage = subjectRepository.findByUserIdAndSubjectNameContainingIgnoreCase(userId, keyword, pageable);
        }

        List<SubjectResponseDTO> dtos = subjectPage.getContent().stream().map(this::convertToResponseDTO).toList();
        return PaginationResponseDTO.fromPage(subjectPage, dtos);
    }

    private Pageable validatePageable(Pageable pageable) {
        if (pageable.getPageSize() > PaginationConfig.getMaxSize()) {
            return PageRequest.of(
                    pageable.getPageNumber(),
                    PaginationConfig.getMaxSize(),
                    pageable.getSort());
        }
        return pageable;
    }

    public SubjectResponseDTO convertToResponseDTO(Subject subject) {
        return new SubjectResponseDTO(
                subject.getId(),
                subject.getSubjectName(),
                subject.getSubjectPriority(),
                subject.getSubjectTag());
    }
}