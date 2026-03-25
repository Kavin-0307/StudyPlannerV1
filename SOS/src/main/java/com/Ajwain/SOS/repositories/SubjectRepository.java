package com.Ajwain.SOS.repositories;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.Ajwain.SOS.entities.Subject;

@Repository
public interface SubjectRepository extends JpaRepository<Subject,Long>{

	List<Subject> findByUserId(long userId);
	boolean existsByUserIdAndSubjectName(long userId,String subjectName);
	Page<Subject> findByUserId(Long userId, Pageable pageable);
	Page<Subject> findByNameAndContainingIgnoreCase(String keyword,Pageable pageable);
}
