package com.Ajwain.SOS.controllers;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.Ajwain.SOS.dto.PaginationResponseDTO;import com.Ajwain.SOS.dto.StudyPlanResponseDTO;
import com.Ajwain.SOS.dto.StudyPlanSearchCriteria;

import com.Ajwain.SOS.entities.enums.StudyStatus;
import com.Ajwain.SOS.services.StudyPlanService;
@RestController
@RequestMapping("/api/studyplans")
public class StudyPlanController {
	private final StudyPlanService studyPlanService;
	public StudyPlanController(StudyPlanService studyPlanService) {
		this.studyPlanService=studyPlanService;
	}
	@PostMapping("/generate")
	public ResponseEntity<List<StudyPlanResponseDTO>> generateStudyPlan(){
		return ResponseEntity.status(HttpStatus.CREATED).body(studyPlanService.generateStudyPlan());
	}
	@GetMapping("/today")
	public ResponseEntity<List<StudyPlanResponseDTO>> getTodayPlan(){
		return ResponseEntity.ok(studyPlanService.getTodayPlan());
	}
	@GetMapping("/user")
	public ResponseEntity<List<StudyPlanResponseDTO>> getFullPlan(){
		return ResponseEntity.ok(studyPlanService.getStudyPlanByUser());
	}
	@GetMapping("/range")
	public ResponseEntity<List<StudyPlanResponseDTO>> getPlanByDateAndRange(@RequestParam LocalDate start,@RequestParam LocalDate end){
		return ResponseEntity.ok(studyPlanService.getPlanByDateRange( start, end));
	}
	@PatchMapping("/{planId}/status")
	public ResponseEntity<StudyPlanResponseDTO> updateStatus(
	        @PathVariable Long planId,
	        @RequestBody Map<String, String> body){

	    return ResponseEntity.ok(
	        studyPlanService.updateStudyStatus(
	            planId,
	            Enum.valueOf(com.Ajwain.SOS.entities.enums.StudyStatus.class, body.get("status"))
	        )
	    );
	}
	@GetMapping("/user/progress")
	public ResponseEntity<Map<String, Long>> getProgress(){
	    return ResponseEntity.ok(studyPlanService.getProgress());
	}
	@GetMapping
	public ResponseEntity<PaginationResponseDTO<StudyPlanResponseDTO>> getStudyPlans(
	        @RequestParam(required = false) Long subjectId,
	        @RequestParam(required = false) StudyStatus status,
	        @RequestParam(required = false) LocalDate fromDate,
	        @RequestParam(required = false) LocalDate toDate,
	        @RequestParam(required = false) Integer minDuration,
	        @RequestParam(required = false) Integer maxDuration,
	        Pageable pageable){

	    StudyPlanSearchCriteria criteria = new StudyPlanSearchCriteria();
	    criteria.setSubjectId(subjectId);
	    criteria.setStatus(status);
	    criteria.setFromDate(fromDate);
	    criteria.setToDate(toDate);
	    criteria.setMinDuration(minDuration);
	    criteria.setMaxDuration(maxDuration);

	    return ResponseEntity.ok(
	            studyPlanService.getStudyPlans(criteria, pageable)
	    );
	}
}
