package com.Ajwain.SOS.dto;

import java.time.LocalDateTime;

import com.Ajwain.SOS.entities.enums.DeadlineType;

public class DeadlineSearchCriteria {
	private String keyword;
	private long subjectId;
	private DeadlineType deadlineType;
	private Integer deadlinePriority;
	private LocalDateTime fromDate;
	private LocalDateTime toDate;
	public String getKeyword() {
		return keyword;
	}
	public void setKeyword(String keyword) {
		this.keyword=keyword;
	}

	public Long getSubjectId() {
		return subjectId;
	}
	public void setSubjectId(Long subjectId)
	{
		this.subjectId=subjectId;
	}
	public DeadlineType getDeadlineType() {
		return deadlineType;
	}
	public void setDeadlineType(DeadlineType deadlineType)
	{
		this.deadlineType=deadlineType;
	}
	public Integer getDeadlinePriority() {
		return deadlinePriority;
	}
	public void setDeadlinePriority(Integer deadlinePriority) {
		this.deadlinePriority=deadlinePriority;
	}

	public LocalDateTime getFromDate() {
		return fromDate;
	}
	public void setFromDate(LocalDateTime fromDate) {
		this.fromDate=fromDate;
	}

	public LocalDateTime getToDate() {
		return toDate;
	}
	public void setToDate(LocalDateTime toDate) {
		this.toDate=toDate;
	}
	
}
