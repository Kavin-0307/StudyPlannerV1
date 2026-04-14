package com.Ajwain.SOS.repositories;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.Ajwain.SOS.entities.Revision;
import com.Ajwain.SOS.entities.User;
import com.Ajwain.SOS.entities.enums.RevisionStatus;

public interface RevisionRepository extends JpaRepository<Revision,Long>,JpaSpecificationExecutor<Revision> {
	List<Revision> findByLectureId(Long lectureId);
	
	List<Revision> findByLectureSubjectUserId(Long userId);
	List<Revision> findByLectureSubjectUserIdAndRevisionDateLessThanEqualAndStatus(
		    Long userId,LocalDate date,RevisionStatus status
		);
	Long countByLectureSubjectUserIdAndStatus(Long userId, RevisionStatus status);
	Page<Revision> findByLectureSubjectUserId(User user, Pageable pageable);
	Page<Revision> findByLectureId(Long lectureId, Pageable pageable);
	Page<Revision> findByLectureSubjectUserIdAndStatus(User user, RevisionStatus status, Pageable pageable);
	Page<Revision> findByLectureSubjectUserIdAndRevisionDateLessThanEqual(User user, LocalDate date, Pageable pageable);
	Page<Revision> findByRevisionDateLessThanEqualAndStatus(LocalDate date, RevisionStatus status, Pageable pageable);

	Page<Revision> findByLectureSubjectUserAndRevisionDateLessThanEqual(User user, LocalDate now, Pageable pageable);

	Page<Revision> findByLectureSubjectUserAndStatus(User user, RevisionStatus pending, Pageable pageable);
}
