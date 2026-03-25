package com.Ajwain.SOS.specifications;

import java.time.LocalDate;

import org.springframework.data.jpa.domain.Specification;

import com.Ajwain.SOS.entities.StudyPlan;
import com.Ajwain.SOS.entities.enums.StudyStatus;

public class StudyPlanSpecification {

    public static Specification<StudyPlan> hasUser(Long userId){
        return (root, query, cb) -> {
            if(userId == null)
                return cb.conjunction();
            return cb.equal(root.get("user").get("id"), userId);
        };
    }

    public static Specification<StudyPlan> hasSubject(Long subjectId){
        return (root, query, cb) -> {
            if(subjectId == null)
                return cb.conjunction();
            return cb.equal(root.get("subject").get("id"), subjectId);
        };
    }

    public static Specification<StudyPlan> hasStatus(StudyStatus status){
        return (root, query, cb) -> {
            if(status == null)
                return cb.conjunction();
            return cb.equal(root.get("status"), status);
        };
    }

    public static Specification<StudyPlan> studyDateAfter(LocalDate fromDate){
        return (root, query, cb) -> {
            if(fromDate == null)
                return cb.conjunction();
            return cb.greaterThanOrEqualTo(root.get("studyDate"), fromDate);
        };
    }

    public static Specification<StudyPlan> studyDateBefore(LocalDate toDate){
        return (root, query, cb) -> {
            if(toDate == null)
                return cb.conjunction();
            return cb.lessThanOrEqualTo(root.get("studyDate"), toDate);
        };
    }

    public static Specification<StudyPlan> durationGreaterThan(Integer minDuration){
        return (root, query, cb) -> {
            if(minDuration == null)
                return cb.conjunction();
            return cb.greaterThanOrEqualTo(root.get("durationMinutes"), minDuration);
        };
    }

    public static Specification<StudyPlan> durationLessThan(Integer maxDuration){
        return (root, query, cb) -> {
            if(maxDuration == null)
                return cb.conjunction();
            return cb.lessThanOrEqualTo(root.get("durationMinutes"), maxDuration);
        };
    }
}