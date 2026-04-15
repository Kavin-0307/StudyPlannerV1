package com.Ajwain.SOS.services;

import java.time.LocalDate;

import org.springframework.stereotype.Service;

import com.Ajwain.SOS.auth.CurrentUserService;
import com.Ajwain.SOS.entities.User;
import com.Ajwain.SOS.entities.enums.StudyStatus;
import com.Ajwain.SOS.repositories.LectureRepository;
import com.Ajwain.SOS.repositories.StudyPlanRepository;

@Service
public class AnalyticsService {
	private final LectureRepository lectureRepository;
	private final StudyPlanRepository studyPlanRepository;
	private final CurrentUserService currentUserService;
	public AnalyticsService(LectureRepository lectureRepository,CurrentUserService currentUserService,StudyPlanRepository studyPlanRepository) {
		this.lectureRepository=lectureRepository;
		this.currentUserService=currentUserService;
		this.studyPlanRepository=studyPlanRepository;
	}
	public Long getCompletedLectures() {
        User user=currentUserService.getCurrentUser();
		return lectureRepository.countBySubject_UserAndProcessedTrue(user);
	}
	public Long getPendingLectures() {
        User user=currentUserService.getCurrentUser();
		return lectureRepository.countBySubject_UserAndProcessedFalse(user);
	}
	public Long getStudyProgressPercentage() {
        User user=currentUserService.getCurrentUser();
		long totalPlans=studyPlanRepository.countByUser(user);
		if(totalPlans==0)
			return 0L;
		long completedPlans=studyPlanRepository.countByUserAndStatus(user, StudyStatus.COMPLETED);
		return Math.round(((double)completedPlans/totalPlans)*100);
	}
	  public Long getStudyHoursThisWeek() {
	        LocalDate today = LocalDate.now();
	        LocalDate weekAgo = today.minusDays(7);
	        User user=currentUserService.getCurrentUser();
	        Long hours= studyPlanRepository.sumStudyHoursBetweenDates(user, weekAgo, today);
	        return hours != null ? hours : 0L;
	  }
	  public Long getTotalStudySessions() {

	        User user=currentUserService.getCurrentUser();
		    return studyPlanRepository.countByUser(user);
		}
	  public Long getCompletedStudySessions(Long userId) {

	        User user=currentUserService.getCurrentUser();
		    return studyPlanRepository.countByUserAndStatus(user, StudyStatus.COMPLETED);
		}
	  
}
