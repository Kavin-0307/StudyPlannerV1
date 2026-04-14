package com.Ajwain.SOS.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.Ajwain.SOS.dto.DashboardResponseDTO;
import com.Ajwain.SOS.dto.DeadlineResponseDTO;
import com.Ajwain.SOS.dto.LectureResponseDTO;
import com.Ajwain.SOS.dto.StudyPlanResponseDTO;

@Service
public class DashboardService {

    private final StudyPlanService studyPlanService;
    private final DeadlineService deadlineService;
    private final LectureService lectureService;
    private final AnalyticsService analyticsService;

    public DashboardService(StudyPlanService studyPlanService,DeadlineService deadlineService,LectureService lectureService,AnalyticsService analyticsService) {
        this.studyPlanService = studyPlanService;
        this.deadlineService = deadlineService;
        this.lectureService = lectureService;
        this.analyticsService = analyticsService;
    }

    public DashboardResponseDTO getDashboard(Long userId) {
        List<StudyPlanResponseDTO> todayPlan =studyPlanService.getTodayPlan(userId);
        
        List<DeadlineResponseDTO> upcomingDeadlines =deadlineService.getUpcomingDeadlines();
        
        List<LectureResponseDTO> pendingLectures=lectureService.getPendingLecturesByUser(userId);
        Long completedLectures=analyticsService.getCompletedLectures(userId);

        Long pendingLecturesCount=analyticsService.getPendingLectures(userId);

        Long progress=analyticsService.getStudyProgressPercentage(userId);

        Long studyHoursWeek=analyticsService.getStudyHoursThisWeek(userId);

        Long totalSessions=analyticsService.getTotalStudySessions(userId);

        Long completedSessions=analyticsService.getCompletedStudySessions(userId);

        return new DashboardResponseDTO(
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