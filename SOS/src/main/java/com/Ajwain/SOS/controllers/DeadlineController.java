package com.Ajwain.SOS.controllers;

import java.time.LocalDateTime;

import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.Ajwain.SOS.dto.DeadlineRequestDTO;
import com.Ajwain.SOS.dto.DeadlineResponseDTO;
import com.Ajwain.SOS.dto.DeadlineSearchCriteria;
import com.Ajwain.SOS.dto.PaginationResponseDTO;
import com.Ajwain.SOS.entities.enums.DeadlineType;
import com.Ajwain.SOS.services.DeadlineService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/deadlines")
public class DeadlineController {

    private final DeadlineService deadlineService;

    public DeadlineController(DeadlineService deadlineService) {
        this.deadlineService = deadlineService;
    }

    // ================= CREATE =================
    @PostMapping("/{subjectId}")
    public ResponseEntity<DeadlineResponseDTO> createDeadline(
            @PathVariable Long subjectId,
            @RequestBody @Valid DeadlineRequestDTO dto) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(deadlineService.createDeadline(subjectId, dto));
    }

    // ================= UPDATE =================
    @PutMapping("/{deadlineId}")
    public ResponseEntity<DeadlineResponseDTO> updateDeadline(
            @PathVariable long deadlineId,
            @RequestBody @Valid DeadlineRequestDTO dto) {

        return ResponseEntity.ok(
                deadlineService.updateDeadline(deadlineId, dto)
        );
    }

    // ================= DELETE =================
    @DeleteMapping("/{deadlineId}")
    public ResponseEntity<Void> deleteDeadline(@PathVariable Long deadlineId) {
        deadlineService.deleteDeadline(deadlineId);
        return ResponseEntity.noContent().build();
    }

    // ================= SEARCH / FILTER / PAGINATION =================
    @GetMapping
    public ResponseEntity<PaginationResponseDTO<DeadlineResponseDTO>> getDeadlines(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) DeadlineType deadlineType,
            @RequestParam(required = false) Integer deadlinePriority,
            @RequestParam(required = false) LocalDateTime fromDate,
            @RequestParam(required = false) LocalDateTime toDate,
            Pageable pageable) {

        DeadlineSearchCriteria criteria = new DeadlineSearchCriteria();
        criteria.setKeyword(keyword);
        criteria.setSubjectId(subjectId);
        criteria.setDeadlineType(deadlineType);
        criteria.setDeadlinePriority(deadlinePriority);
        criteria.setFromDate(fromDate);
        criteria.setToDate(toDate);

        return ResponseEntity.ok(
                deadlineService.getDeadlines(criteria, pageable)
        );
    }
}