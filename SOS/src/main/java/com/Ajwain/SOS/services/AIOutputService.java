package com.Ajwain.SOS.services;

import java.util.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;

import com.Ajwain.SOS.dto.AIOutputDTO;
import com.Ajwain.SOS.dto.AIRequestDTO;
import com.Ajwain.SOS.dto.AIResponseDTO;
import com.Ajwain.SOS.dto.IndexRequestDTO;
import com.Ajwain.SOS.dto.QueryRequestDTO;
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

	
	public AIResponseDTO generateAIOutputsForLecture(String lectureText) {

    AIRequestDTO processRequest = new AIRequestDTO();
    processRequest.setText(lectureText);

    try {
    	HttpHeaders headers = new HttpHeaders();
    	headers.setContentType(MediaType.APPLICATION_JSON);

    	HttpEntity<AIRequestDTO> request = new HttpEntity<>(processRequest, headers);

    	ResponseEntity<AIResponseDTO> response = restTemplate.postForEntity(
    	        url + "/process",
    	        request,
    	        AIResponseDTO.class
    	);

    	return response.getBody();
    } catch (Exception e) {
        logger.error("Processing failed", e);
        throw new RuntimeException("AI processing failed");
    }
}
	@Transactional
	public void saveAIOutputs(Lecture lecture, AIResponseDTO response) {


    aiOutputRepository.deleteByLectureId(lecture.getId());

    saveAIOutput(lecture, response);
}public void indexLecture(String lectureText, Long lectureId) {
    String sessionId = "lecture_" + lectureId;

    IndexRequestDTO indexRequest = new IndexRequestDTO(lectureText, sessionId);

    try {
    	HttpHeaders headers = new HttpHeaders();
    	headers.setContentType(MediaType.APPLICATION_JSON);

    	HttpEntity<IndexRequestDTO> request = new HttpEntity<>(indexRequest, headers);

    	restTemplate.postForEntity(url + "/index", request, Map.class);
    } catch (Exception e) {
        throw new RuntimeException("Indexing failed");
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

	public List<AIOutputDTO> getOutputsForLecture(Long lectureId) {
	    return aiOutputRepository.findByLectureId(lectureId)
	        .stream().map(this::toDTO).toList();
	}
	public AIOutputDTO getOutputByType(Long lectureId, OutputType type) {
		AI_Output entity=aiOutputRepository.findByLectureIdAndAiOutputType(lectureId, type);
		if(entity==null)return null;
		return toDTO(entity);
	}

	
	public List<Map<String,Object>> queryLecture(String question, Long lectureId) {
		if (question == null || question.isBlank()) {
		    throw new BadRequestException("Question cannot be empty");
		}
		if (lectureId == null) {
		    throw new BadRequestException("lectureId is required");
		}
		String sessionId = "lecture_" + lectureId;
		QueryRequestDTO request = new QueryRequestDTO();
		request.setQuestion(question);
		request.setSessionId(sessionId);
		request.setK(3);
		try {
			
			Map<String, Object> response = restTemplate.postForObject(url + "/query", request, Map.class);
			if (response == null || !response.containsKey("results"))
				return List.of();

			@SuppressWarnings("unchecked")
			List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");
			return results.stream().map(r->{Map<String,Object> item=new HashMap<>();
											item.put("text", r.get("text"));
											item.put("score", r.get("score"));
											item.put("rank", r.get("rank"));
											return item;
			}).toList();
		} catch (HttpClientErrorException e) {
		    if (e.getStatusCode().is4xxClientError()) {
		        throw new BadRequestException(
		            "Document index not available. "
		            + "The lecture was processed but the index may have been lost. "
		            + "Please re-process the lecture (lectureId=" + lectureId + ")."
		        );
		    }
		    throw new RuntimeException("Query service temporarily unavailable");
		}
	}
	private AIOutputDTO toDTO(AI_Output a) {
	    return new AIOutputDTO(
	        a.getId(),
	        a.getLecture().getId(),
	        a.getOutputType().name(),
	        a.getOutputContent(),
	        a.getGeneratedAt()
	    );
	}
}
