package com.Ajwain.SOS.entities;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.Ajwain.SOS.entities.enums.StudyStatus;

import jakarta.persistence.*;

@Entity
@Table(name="study_plan")
public class StudyPlan {
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private long id;
	
	@ManyToOne(fetch=FetchType.LAZY,optional=false)
	@JoinColumn(name="user_id",nullable=false)
	private User user;
	
	@ManyToOne(fetch=FetchType.LAZY, optional=false)
	@JoinColumn(name="subject_id", nullable=false)
	private Subject subject;
	
	@Column(name="study_date",nullable=false)
	private LocalDate studyDate;
	@Column(name="duration_minutes", nullable=false)
	private int durationMinutes;
	@Enumerated(EnumType.STRING)
	@Column(name="status", nullable=false)
	private StudyStatus status;
	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;
	@PrePersist
	protected void onCreate() {
	    createdAt = LocalDateTime.now();
	}
	
	public long getId() {
		return id;
	}
	public User getUser() {
		return user;
	}
	public void setUser(User user) {
		this.user=user;
	}
	public Subject getSubject() {
		return subject;
	}
	public void setSubject(Subject subject) {
		this.subject=subject;
	}
	public LocalDate getStudyDate() {
		return studyDate;
	}
	public void setStudyDate(LocalDate studyDate) {
		this.studyDate=studyDate;
	}
	public void setStudyStatus(StudyStatus status) {
		this.status=status;
	}
	public StudyStatus getStudyStatus() {
		return status;
	}
	public int getDurationMinutes() {
	    return durationMinutes;
	}

	public void setDurationMinutes(int durationMinutes) {
	    this.durationMinutes = durationMinutes;
	}
	
}
