package com.Ajwain.SOS.services;

import java.util.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.Ajwain.SOS.dto.AIRequestDTO;
import com.Ajwain.SOS.dto.AIResponseDTO;
import com.Ajwain.SOS.dto.IndexRequestDTO;
import com.Ajwain.SOS.entities.AI_Output;
import com.Ajwain.SOS.entities.Lecture;
import com.Ajwain.SOS.entities.enums.OutputType;
import com.Ajwain.SOS.exception.BadRequestException;
import com.Ajwain.SOS.repositories.AIOutputRepository;

@Service
public class AIOutputService {
	private final AIOutputRepository aiOutputRepository;
	@Value("${docmind.api.url:http://127.0.0.1:8000/api}")
	private String url;
	private final RestTemplate restTemplate;
	private final Logger logger = LoggerFactory.getLogger(AIOutputService.class);

	public AIOutputService(AIOutputRepository aiOutputRepository, RestTemplate restTemplate) {
		this.aiOutputRepository = aiOutputRepository;
		this.restTemplate = restTemplate;
	}

	/**
	 * Calls /api/process then /api/index on the ML service.
	 * session_id is derived deterministically as "lecture_" + lecture.getId()
	 * so it can be reconstructed at query time without extra storage.
	 */
	public void generateAIOutputsForLecture(Lecture lecture, String lectureText) {
		String sessionId = "lecture_" + lecture.getId();

		// Step 1: process text → keywords, summary, important_points, revision_sheet
		AIRequestDTO processRequest = new AIRequestDTO();
		processRequest.setText(lectureText);

		AIResponseDTO response = restTemplate.postForObject(url + "/process", processRequest, AIResponseDTO.class);
		if (response != null)
			saveAIOutput(lecture, response);

		// Step 2: build FAISS index for Q&A — session_id is now included (BUG-01 fix)
		IndexRequestDTO indexRequest = new IndexRequestDTO(lectureText, sessionId);
		try {
			restTemplate.postForObject(url + "/index", indexRequest, java.util.Map.class);
			logger.info("Lecture {} indexed successfully with session_id={}", lecture.getId(), sessionId);
		} catch (HttpClientErrorException e) {
			// Log but do not re-throw — AI outputs are already saved; indexing failure
			// should not roll back the successful /process step.
			logger.error("Indexing failed for lecture {} (session_id={}): {} — {}",
					lecture.getId(), sessionId, e.getStatusCode(), e.getResponseBodyAsString());
		}
	}

	private void saveAIOutput(Lecture lecture, AIResponseDTO response) {
		AI_Output keywordsOutput = new AI_Output();
		keywordsOutput.setLecture(lecture);
		keywordsOutput.setOutputType(OutputType.KEYWORDS);
		keywordsOutput.setOutputContent(String.join(", ", response.keywords()));
		aiOutputRepository.save(keywordsOutput);

		AI_Output summaryOutput = new AI_Output();
		summaryOutput.setLecture(lecture);
		summaryOutput.setOutputType(OutputType.SUMMARY);
		summaryOutput.setOutputContent(response.summary());
		aiOutputRepository.save(summaryOutput);

		AI_Output pointsOutput = new AI_Output();
		pointsOutput.setLecture(lecture);
		pointsOutput.setOutputType(OutputType.IMPORTANT_POINTS);
		pointsOutput.setOutputContent(String.join("\n", response.importantPoints()));
		aiOutputRepository.save(pointsOutput);

		AI_Output sheetOutput = new AI_Output();
		sheetOutput.setLecture(lecture);
		sheetOutput.setOutputType(OutputType.REVISION_SHEET);
		sheetOutput.setOutputContent(response.revisionSheet());
		aiOutputRepository.save(sheetOutput);
	}

	public List<AI_Output> getOutputsForLecture(Long lectureId) {
		return aiOutputRepository.findByLectureId(lectureId);
	}

	public AI_Output getOutputByType(Long lectureId, OutputType type) {
		return aiOutputRepository.findByLectureIdAndOutputType(lectureId, type);
	}

	/**
	 * Queries the FAISS index for the given lecture.
	 * session_id is reconstructed from lectureId — matches what was used at index time.
	 * Throws BadRequestException (→ HTTP 400) if the lecture has not been indexed yet.
	 */
	public List<String> queryLecture(String question, Long lectureId) {
		String sessionId = "lecture_" + lectureId;
		Map<String, Object> body = new HashMap<>();
		body.put("question", question);
		body.put("session_id", sessionId);   // BUG-02 fix: session_id was never sent
		body.put("k", 3);

		try {
			Map<String, Object> response = restTemplate.postForObject(url + "/query", body, Map.class);
			if (response == null || !response.containsKey("results"))
				return List.of();

			@SuppressWarnings("unchecked")
			List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");
			return results.stream()
					.map(r -> (String) r.get("text"))
					.toList();
		} catch (HttpClientErrorException e) {
			throw new BadRequestException(
					"Lecture not indexed yet. Please process the lecture first (lectureId=" + lectureId + ").");
		}
	}
}
