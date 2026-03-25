package com.Ajwain.SOS.dto;

import java.time.LocalDate;
import com.Ajwain.SOS.entities.enums.StudyStatus;

public class StudyPlanSearchCriteria {

    private Long userId;
    private Long subjectId;
    private StudyStatus status;
    private LocalDate fromDate;
    private LocalDate toDate;
    private Integer minDuration;
    private Integer maxDuration;

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

    public StudyStatus getStatus() { return status; }
    public void setStatus(StudyStatus status) { this.status = status; }

    public LocalDate getFromDate() { return fromDate; }
    public void setFromDate(LocalDate fromDate) { this.fromDate = fromDate; }

    public LocalDate getToDate() { return toDate; }
    public void setToDate(LocalDate toDate) { this.toDate = toDate; }

    public Integer getMinDuration() { return minDuration; }
    public void setMinDuration(Integer minDuration) { this.minDuration = minDuration; }

    public Integer getMaxDuration() { return maxDuration; }
    public void setMaxDuration(Integer maxDuration) { this.maxDuration = maxDuration; }
}