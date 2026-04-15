package com.Ajwain.SOS.repositories;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.Ajwain.SOS.entities.Deadline;
import com.Ajwain.SOS.entities.Subject;
import com.Ajwain.SOS.entities.User;
import com.Ajwain.SOS.entities.enums.DeadlineType;

@Repository
public interface DeadlineRepository extends JpaRepository<Deadline,Long>,JpaSpecificationExecutor<Deadline>{
	List<Deadline> findBySubject_User(User user);
	Page<Deadline> findBySubject_User(User user, Pageable pageable);
	List<Deadline> findBySubjectId(Long subjectId);
	List<Deadline> findBySubjectUserIdAndDeadlineDateAfterOrderByDeadlineDateAsc(long userId,LocalDateTime now);
	
	@Query("""
		    SELECT d FROM Deadline d
		    JOIN FETCH d.subject s
		    JOIN FETCH s.user
		    WHERE s.user= :user
		    AND d.deadlineDate > CURRENT_TIMESTAMP
		    ORDER BY d.deadlineDate ASC, s.subjectPriority ASC
		""")
		List<Deadline> findUpcomingDeadlinesWithPriority(@Param("user")User user);
	Page<Deadline> findBySubjectId(long subjectId,Pageable pageable);
	Page<Deadline> findBySubjectUserId(Long userId,Pageable pageable);

	Page<Deadline> findByDeadlineDateAfter(LocalDateTime date,Pageable pageable);
	Page<Deadline> findByDeadlineType(DeadlineType type,Pageable pageable);
	Page<Deadline> findBySubjectIdAndDeadlineType(long subjectIdj,DeadlineType type,Pageable pageable);
	
	Page<Deadline> findByDeadlineDateBefore(LocalDateTime dateId,Pageable pageable);
	List<Deadline> findBySubject_UserAndSubject(User user, Subject subject);
	List<Deadline> findBySubjectUserAndDeadlineDateAfterOrderByDeadlineDateAsc(User user, LocalDateTime now);
}
/*The query does these things in order:
 * it fetches the deadline and uses join subject for filtering and sorting. 
 * What hibernate does in the service when d.getSubject().getUser()
 * then hibernate first fetches the deadlines,fetch subject per deadline and then fetch user per subject
 * The FETCH here selects the deadlines and subject and user all in one query*/
