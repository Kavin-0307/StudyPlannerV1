package com.Ajwain.SOS.controllers;

import java.time.LocalDate;

import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.Ajwain.SOS.dto.LectureRequestDTO;
import com.Ajwain.SOS.dto.LectureResponseDTO;
import com.Ajwain.SOS.dto.LectureSearchCriteria;
import com.Ajwain.SOS.dto.PaginationResponseDTO;
import com.Ajwain.SOS.services.LectureService;

@RestController
@RequestMapping("/api/lectures")
public class LectureController {

    private final LectureService lectureService;

    public LectureController(LectureService lectureService) {
        this.lectureService = lectureService;
    }

    // ================= CREATE =================
    @PostMapping(value = "/{subjectId}", consumes = {"multipart/form-data"})
    public ResponseEntity<LectureResponseDTO> createLecture(
            @PathVariable Long subjectId,
            @RequestPart("file") MultipartFile file,
            @RequestPart("dto") LectureRequestDTO dto) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(lectureService.createLecture(file, subjectId, dto));
    }

    // ================= PROCESS =================
    @PostMapping("/{lectureId}/process")
    public ResponseEntity<LectureResponseDTO> processLecture(
            @PathVariable Long lectureId) {

        return ResponseEntity.ok(
                lectureService.processLecture(lectureId)
        );
    }

    // ================= DELETE =================
    @DeleteMapping("/{lectureId}")
    public ResponseEntity<Void> deleteLecture(@PathVariable Long lectureId) {
        lectureService.deleteLecture(lectureId);
        return ResponseEntity.noContent().build();
    }

    // ================= GET ONE =================
    @GetMapping("/{lectureId}")
    public LectureResponseDTO getLecture(@PathVariable Long lectureId) {
        return lectureService.getLectureById(lectureId);
    }

    // ================= SEARCH / FILTER / PAGINATION =================
    @GetMapping
    public ResponseEntity<PaginationResponseDTO<LectureResponseDTO>> getLectures(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) Boolean processed,
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate,
            Pageable pageable) {

        LectureSearchCriteria criteria = new LectureSearchCriteria();
        criteria.setKeyword(keyword);
        criteria.setSubjectId(subjectId);
        criteria.setProcessed(processed);
        criteria.setFromDate(fromDate);
        criteria.setToDate(toDate);

        return ResponseEntity.ok(
                lectureService.getLectures(criteria, pageable)
        );
    }
}