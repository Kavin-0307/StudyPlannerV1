package com.Ajwain.SOS.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.Ajwain.SOS.entities.Lecture;
import com.Ajwain.SOS.entities.Subject;
import com.Ajwain.SOS.entities.User;

@Repository
public interface LectureRepository extends JpaRepository<Lecture,Long> ,JpaSpecificationExecutor<Lecture>{

	List<Lecture> findBySubjectId(long subjectId);
	List<Lecture> findBySubjectIdAndProcessedTrue(long subjectId);
	Long countBySubject_UserAndProcessedTrue(User user);
	Long countBySubject_UserAndProcessedFalse(User user);
	
	Page<Lecture> findBySubjectId(long subjectId,Pageable pageable);
	Page<Lecture> findBySubjectUserId(long userId,Pageable pageable);
	Page<Lecture> findByProcessed(boolean processed,Pageable pageable);
	Page<Lecture> findBySubjectIdAndProcessed(Long subjectId, boolean processed, Pageable pageable);
    Page<Lecture> findAll(Specification<Lecture> spec, Pageable pageable);
	Page<Lecture> findBySubject(Subject subject, Pageable pageable);
	Page<Lecture> findBySubject_UserAndProcessed(User user, boolean processed, Pageable pageable);
	List<Lecture> findBySubject_UserAndProcessedFalse(User user);
}
