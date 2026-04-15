package com.Ajwain.SOS.repositories;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.Ajwain.SOS.entities.StudyPlan;
import com.Ajwain.SOS.entities.User;
import com.Ajwain.SOS.entities.enums.StudyStatus;

@Repository
public interface StudyPlanRepository extends JpaRepository<StudyPlan,Long>, JpaSpecificationExecutor<StudyPlan>{

	void deleteByUserId(long userId);
	List<StudyPlan> findByUserId(long userId);
	List<StudyPlan> findByUserIdAndStudyDate(Long userId, LocalDate date);
	List<StudyPlan> findByUserIdAndStudyDateBetween(Long userId, LocalDate start, LocalDate end);
	@Query(
			"""
			SELECT sp FROM StudyPlan sp
			JOIN FETCH sp.user
			JOIN FETCH sp.subject
			WHERE sp.user.id= :userId
			ORDER BY sp.studyDate ASC
			""")
	List<StudyPlan> findFullPlanWithRelations(@Param("userId")Long userId);
	@Query(
			"""
			SELECT sp FROM StudyPlan sp
			JOIN FETCH sp.user
			JOIN FETCH sp.subject
			WHERE sp.user.id= :userId
			AND sp.studyDate= :date
			""")
	List<StudyPlan> findTodayPlanWithRelations(@Param("userId")Long userId,@Param("date")LocalDate date);
	@Query("""
			SELECT sp FROM StudyPlan sp
			JOIN FETCH sp.user
			JOIN FETCH sp.subject
			WHERE sp.user.id = :userId
			AND sp.studyDate BETWEEN :start AND :end
			ORDER BY sp.studyDate ASC
			""")
			List<StudyPlan> findPlanInRangeWithRelations(
			    @Param("userId") Long userId,
			    @Param("start") LocalDate start,
			    @Param("end") LocalDate end
			);
	Long countByUser(User user);
	Long countByUserAndStatus(User user,StudyStatus status);
	@Query("SELECT COALESCE(SUM(s.durationMinutes), 0) FROM StudyPlan s " +
		       "WHERE s.user = :user " +
		       "AND s.studyDate BETWEEN :startDate AND :endDate")
		Long sumStudyHoursBetweenDates(
		        @Param("user") User user,
		        @Param("startDate") LocalDate startDate,
		        @Param("endDate") LocalDate endDate
		);
	Page<StudyPlan> findByUserId(Long userId, Pageable pageable);

Page<StudyPlan> findByUserIdAndStudyDate(Long userId, LocalDate date, Pageable pageable);

Page<StudyPlan> findByUserIdAndStudyStatus(Long userId, StudyStatus status, Pageable pageable);

Page<StudyPlan> findByUserIdAndStudyDateBetween(Long userId, LocalDate start, LocalDate end, Pageable pageable);}
