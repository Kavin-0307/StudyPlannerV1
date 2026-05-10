package com.Ajwain.SOS.controllers;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.PostMapping;

import org.springframework.web.bind.annotation.RequestBody;

import com.Ajwain.SOS.dto.AIOutputDTO;
import com.Ajwain.SOS.dto.LectureQueryRequest;
import com.Ajwain.SOS.dto.QueryResultDTO;
import com.Ajwain.SOS.entities.AI_Output;
import com.Ajwain.SOS.entities.enums.OutputType;
import com.Ajwain.SOS.services.AIOutputService;
import com.Ajwain.SOS.services.LectureService;

import jakarta.validation.Valid;
@RestController
@RequestMapping("/api/ai-output")
public class AIOutputController {

	private final AIOutputService aiOutputService;
	private final LectureService lectureService;

	public AIOutputController(AIOutputService aiOutputService, LectureService lectureService) {
	    this.aiOutputService = aiOutputService;
	    this.lectureService = lectureService;
	}

	@GetMapping("/lecture/{lectureId}")
	public ResponseEntity<List<AIOutputDTO>> getAllOutputs(@PathVariable Long lectureId) {
	    lectureService.getLectureById(lectureId);
	    return ResponseEntity.ok(aiOutputService.getOutputsForLecture(lectureId));
	}
	@PostMapping("/query")
	public ResponseEntity<List<Map<String, Object>>> queryLecture(@RequestBody@Valid LectureQueryRequest request) {

	    lectureService.getLectureById(request.lectureId());
	    return ResponseEntity.ok(aiOutputService.queryLecture(request.question(), request.lectureId()));
	}
	@GetMapping("/lecture/{lectureId}/summary")
	public ResponseEntity<AIOutputDTO> getSummary(@PathVariable Long lectureId) {

	    lectureService.getLectureById(lectureId); 
	    return ResponseEntity.ok(aiOutputService.getOutputByType(lectureId, OutputType.SUMMARY));
	}

    @GetMapping("/lecture/{lectureId}/keywords")
    public ResponseEntity<AIOutputDTO> getKeywords(@PathVariable Long lectureId) {
    	 lectureService.getLectureById(lectureId);
        return ResponseEntity.ok(aiOutputService.getOutputByType(lectureId,OutputType.KEYWORDS));
    }

    @GetMapping("/lecture/{lectureId}/revision-sheet")
    public ResponseEntity<AIOutputDTO> getRevisionSheet(@PathVariable Long lectureId) {
    	 lectureService.getLectureById(lectureId);
        return ResponseEntity.ok(aiOutputService.getOutputByType(lectureId,OutputType.REVISION_SHEET));
    }
    
    @GetMapping("/lecture/{lectureId}/important-points")
    public ResponseEntity<AIOutputDTO> getImportantPoints(@PathVariable long lectureId){
    	lectureService.getLectureById(lectureId);
    	return ResponseEntity.ok(aiOutputService.getOutputByType(lectureId, OutputType.IMPORTANT_POINTS));
    }
}