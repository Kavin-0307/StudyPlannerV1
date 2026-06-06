package com.Ajwain.SOS.services;

import java.util.List;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.Ajwain.SOS.dto.DashboardResponseDTO;
import com.Ajwain.SOS.dto.DeadlineResponseDTO;
import com.Ajwain.SOS.dto.LectureResponseDTO;
import com.Ajwain.SOS.dto.StudyPlanResponseDTO;

@Service
public class DashboardService {
	private final RevisionService revisionService;
    private final StudyPlanService studyPlanService;
    private final DeadlineService deadlineService;
    private final LectureService lectureService;
    private final AnalyticsService analyticsService;

    public DashboardService(RevisionService revisionService,StudyPlanService studyPlanService,DeadlineService deadlineService,LectureService lectureService,AnalyticsService analyticsService) {
        this.studyPlanService = studyPlanService;
        this.deadlineService = deadlineService;
        this.lectureService = lectureService;
        this.revisionService=revisionService;
        this.analyticsService = analyticsService;
    }
    public DashboardResponseDTO getDashboard(Long userId) {
        List<StudyPlanResponseDTO> todayPlan =studyPlanService.getTodayPlan();
        
        List<DeadlineResponseDTO> upcomingDeadlines =deadlineService.getUpcomingDeadlines();
        
        List<LectureResponseDTO> pendingLectures=lectureService.getPendingLecturesByUser();
        Long completedLectures=analyticsService.getCompletedLectures();

        Long pendingLecturesCount=analyticsService.getPendingLectures();

        Long progress=analyticsService.getStudyProgressPercentage();
        Long pendingRevisionsCount = revisionService.countPendingRevisionsByUser();

        Long studyHoursWeek=analyticsService.getStudyHoursThisWeek();

        Long totalSessions=analyticsService.getTotalStudySessions();

        Long completedSessions=analyticsService.getCompletedStudySessions(userId);

        return new DashboardResponseDTO(
        		pendingRevisionsCount,

                todayPlan,
                upcomingDeadlines,
                pendingLectures,
                completedLectures,
                pendingLecturesCount,
                progress,
                studyHoursWeek,
                totalSessions,
                completedSessions
        );
    }
}