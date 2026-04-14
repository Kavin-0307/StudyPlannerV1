package com.Ajwain.SOS.specifications;

import java.time.LocalDate;

import org.springframework.data.jpa.domain.Specification;

import com.Ajwain.SOS.entities.Lecture;

public class LectureSpecification {
	public static Specification<Lecture> hasKeyword(String keyword){
		return(root,query,cb)->{
		if(keyword==null||keyword.isBlank()) {
			return cb.conjunction();
		}
		
			return cb.like(cb.lower(root.get("textContent"))//
					,"%"+keyword.toLowerCase()+"%");
		};
	}
	public static Specification<Lecture> hasSubject(Long subjectId){
		return(root,query,cb)->{
			if(subjectId!=null) {
				return cb.equal(root.get("subject").get("id"),subjectId);
			}
			else
				 return cb.conjunction();
		};
	}
	public static Specification<Lecture> isProcessed(Boolean processed){
		return(root,query,cb)->{
			if(processed!=null) {
				return cb.equal(root.get("processed"), processed);
			}
			else
				return cb.conjunction();
		};
	}
	public static Specification<Lecture> uploadDateAfter(LocalDate fromDate){
		return (root,query,cb)->{
			if(fromDate==null)
				return cb.conjunction();
			else
				return cb.greaterThanOrEqualTo(root.get("uploadDate"),fromDate);
		};
	}
	public static Specification<Lecture> uploadDateBefore(LocalDate toDate){
		return (root,query,cb)->{
			if(toDate==null)
				return cb.conjunction();
			else
				return cb.lessThanOrEqualTo(root.get("uploadDate"),toDate);
		};
	}
	public static Specification<Lecture> belongsToUser(Long userId) {
	    return (root, query, cb) -> {
	        if (userId == null) {
	            return cb.conjunction();
	        }

	        return cb.equal(
	            root.get("subject").get("user").get("id"),
	            userId
	        );
	    };
	}
}
