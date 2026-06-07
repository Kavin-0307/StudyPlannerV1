package com.Ajwain.SOS.repositories;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.Ajwain.SOS.entities.Revision;
import com.Ajwain.SOS.entities.User;
import com.Ajwain.SOS.entities.enums.RevisionStatus;

public interface RevisionRepository extends JpaRepository<Revision,Long>,JpaSpecificationExecutor<Revision> {
	List<Revision> findByLectureId(Long lectureId);
	Page<Revision> findByLectureIdAndLectureSubjectUserId(Long lectureId,Long userId,Pageable pageable);
	List<Revision> findByLectureSubjectUserId(Long userId);
	List<Revision> findByLectureSubjectUserIdAndRevisionDateLessThanEqualAndStatus(
		    Long userId,LocalDate date,RevisionStatus status
		);
	@Override
	@EntityGraph(attributePaths = {"lecture", "lecture.subject"})
	Page<Revision> findAll(
	    Specification<Revision> spec,
	    Pageable pageable
	);
	Long countByLectureSubjectUserIdAndStatus(Long userId, RevisionStatus status);
	Page<Revision> findByLectureSubjectUserId(User user, Pageable pageable);
	Page<Revision> findByLectureId(Long lectureId, Pageable pageable);
	Page<Revision> findByLectureSubjectUserIdAndStatus(User user, RevisionStatus status, Pageable pageable);
	Page<Revision> findByLectureSubjectUserIdAndRevisionDateLessThanEqual(User user, LocalDate date, Pageable pageable);
	Page<Revision> findByRevisionDateLessThanEqualAndStatus(LocalDate date, RevisionStatus status, Pageable pageable);

	Page<Revision> findByLectureSubjectUserAndRevisionDateLessThanEqual(User user, LocalDate now, Pageable pageable);
	Long countByLectureSubjectUserAndStatus(User user, RevisionStatus status);
	Page<Revision> findByLectureSubjectUserAndStatus(User user, RevisionStatus pending, Pageable pageable);
	@Query("""
			SELECT r FROM Revision r
			JOIN FETCH r.lecture l
			JOIN FETCH l.subject s
			WHERE s.user = :user
			""")
			Page<Revision> findAllByUserWithLectureAndSubject(
			@Param("user") User user,
			Pageable pageable
			);

			@Query("""
			SELECT r FROM Revision r
			JOIN FETCH r.lecture l
			JOIN FETCH l.subject s
			WHERE s.user = :user
			AND r.status = :status
			""")
			Page<Revision> findAllByUserAndStatusWithRelations(
			@Param("user") User user,
			@Param("status") RevisionStatus status,
			Pageable pageable
			);

			@Query("""
					SELECT r FROM Revision r
					JOIN FETCH r.lecture l
					JOIN FETCH l.subject s
					WHERE s.user = :user
					AND r.revisionDate <= :date
					AND r.status = :status
					""")
					Page<Revision> findDueRevisionsWithRelations(
					        @Param("user") User user,
					        @Param("date") LocalDate date,
					        @Param("status") RevisionStatus status,
					        Pageable pageable
					);

}
