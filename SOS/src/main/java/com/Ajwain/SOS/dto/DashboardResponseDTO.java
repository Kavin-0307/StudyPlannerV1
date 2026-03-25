package com.Ajwain.SOS.dto;

import java.util.List;

public class DashboardResponseDTO {

    private List<StudyPlanResponseDTO> todayStudyPlan;
    private List<DeadlineResponseDTO> upcomingDeadlines;
    private List<LectureResponseDTO> pendingLectures;

    private Long completedLectures;
    private Long pendingLecturesCount;
    private Long progressPercentage;
    private Long studyHoursThisWeek;
    private Long totalStudySessions;
    private Long completedStudySessions;

    public DashboardResponseDTO() {}

    public DashboardResponseDTO(
            List<StudyPlanResponseDTO> todayStudyPlan,
            List<DeadlineResponseDTO> upcomingDeadlines,
            List<LectureResponseDTO> pendingLectures,
            Long completedLectures,
            Long pendingLecturesCount,
            Long progressPercentage,
            Long studyHoursThisWeek,
            Long totalStudySessions,
            Long completedStudySessions) {

        this.todayStudyPlan = todayStudyPlan;
        this.upcomingDeadlines = upcomingDeadlines;
        this.pendingLectures = pendingLectures;
        this.completedLectures = completedLectures;
        this.pendingLecturesCount = pendingLecturesCount;
        this.progressPercentage = progressPercentage;
        this.studyHoursThisWeek = studyHoursThisWeek;
        this.totalStudySessions = totalStudySessions;
        this.completedStudySessions = completedStudySessions;
    }

    public List<StudyPlanResponseDTO> getTodayStudyPlan() {
        return todayStudyPlan;
    }

    public void setTodayStudyPlan(List<StudyPlanResponseDTO> todayStudyPlan) {
        this.todayStudyPlan = todayStudyPlan;
    }

    public List<DeadlineResponseDTO> getUpcomingDeadlines() {
        return upcomingDeadlines;
    }

    public void setUpcomingDeadlines(List<DeadlineResponseDTO> upcomingDeadlines) {
        this.upcomingDeadlines = upcomingDeadlines;
    }

    public List<LectureResponseDTO> getPendingLectures() {
        return pendingLectures;
    }

    public void setPendingLectures(List<LectureResponseDTO> pendingLectures) {
        this.pendingLectures = pendingLectures;
    }

    public Long getCompletedLectures() {
        return completedLectures;
    }

    public void setCompletedLectures(Long completedLectures) {
        this.completedLectures = completedLectures;
    }

    public Long getPendingLecturesCount() {
        return pendingLecturesCount;
    }

    public void setPendingLecturesCount(Long pendingLecturesCount) {
        this.pendingLecturesCount = pendingLecturesCount;
    }

    public Long getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(Long progressPercentage) {
        this.progressPercentage = progressPercentage;
    }

    public Long getStudyHoursThisWeek() {
        return studyHoursThisWeek;
    }

    public void setStudyHoursThisWeek(Long studyHoursThisWeek) {
        this.studyHoursThisWeek = studyHoursThisWeek;
    }

    public Long getTotalStudySessions() {
        return totalStudySessions;
    }

    public void setTotalStudySessions(Long totalStudySessions) {
        this.totalStudySessions = totalStudySessions;
    }

    public Long getCompletedStudySessions() {
        return completedStudySessions;
    }

    public void setCompletedStudySessions(Long completedStudySessions) {
        this.completedStudySessions = completedStudySessions;
    }
}