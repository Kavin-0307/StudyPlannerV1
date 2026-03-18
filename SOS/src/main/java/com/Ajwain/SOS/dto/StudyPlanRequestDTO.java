package com.Ajwain.SOS.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.*;

public class StudyPlanRequestDTO {

    @NotNull
    private Long userId;

    @NotNull
    private Long subjectId;

    @NotNull
    private LocalDate studyDate;

    @Positive
    private int durationMinutes;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
    }

    public LocalDate getStudyDate() {
        return studyDate;
    }

    public void setStudyDate(LocalDate studyDate) {
        this.studyDate = studyDate;
    }

    public int getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(int durationMinutes) {
        this.durationMinutes = durationMinutes;
    }
}