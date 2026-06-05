package com.Ajwain.SOS.dto;

import java.time.LocalDate;

import com.Ajwain.SOS.entities.enums.RevisionStatus;

public class RevisionSearchCriteria {

    private Long userId;
    private Long lectureId;
    private RevisionStatus status;
    private Integer revisionNumber;
    private LocalDate fromDate;
    private LocalDate toDate;
    public void setUserId(Long userId) {
    	this.userId=userId;
    }
    public void setLectureId(Long lectureId) {
    	this.lectureId=lectureId;
    }
    public void setRevisionStatus(RevisionStatus revisionStatus) {
    	this.status=revisionStatus;
    }
    public void setRevisionNumber(Integer revisionNumber) {
    	this.revisionNumber=revisionNumber;
    }
    public void setFromDate(LocalDate fromDate) {
    	this.fromDate=fromDate;
    }
    public void setToDate(LocalDate toDate) {
    	this.toDate=toDate;
    }
    public Long getLectureId() {
    	return lectureId;
    }
    public Long getUserId() {
    	return userId;
    }
    public RevisionStatus getRevisionStatus() {
    	return status;
    }
    public Integer getRevisionNumber() {
    	return revisionNumber;
    }
    public LocalDate getFromDate() {
    	return fromDate;
    }
    public LocalDate getToDate() {
    	return toDate;
    }
}
