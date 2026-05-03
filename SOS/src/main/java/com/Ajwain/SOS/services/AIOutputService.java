package com.Ajwain.SOS.services;

import java.util.*;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.Ajwain.SOS.dto.AIRequestDTO;
import com.Ajwain.SOS.dto.AIResponseDTO;
import com.Ajwain.SOS.entities.AI_Output;
import com.Ajwain.SOS.entities.Lecture;
import com.Ajwain.SOS.entities.enums.OutputType;
import com.Ajwain.SOS.repositories.AIOutputRepository;

@Service
public class AIOutputService {
	private final AIOutputRepository aiOutputRepository;
	private final String url="http://127.0.0.1:8000/api";
	private final RestTemplate restTemplate;
	public AIOutputService(AIOutputRepository aiOutputRepository) {
		this.aiOutputRepository=aiOutputRepository;
		this.restTemplate=new RestTemplate();
	}
	public void  generateAIOutputsForLecture(Lecture lecture,String lectureText) {
		AIRequestDTO request=new AIRequestDTO();
		request.setText(lectureText);
		
		AIResponseDTO response=restTemplate.postForObject(url+"/process",request, AIResponseDTO.class);
		if(response!=null)
		saveAIOutput(lecture,response);
		restTemplate.postForObject(url+"/index", request, java.util.Map.class);
	}

	private void saveAIOutput(Lecture lecture,AIResponseDTO response) {
		AI_Output keywordsOutput=new AI_Output();
		keywordsOutput.setLecture(lecture);
		keywordsOutput.setOutputType(OutputType.KEYWORDS);
		keywordsOutput.setOutputContent(String.join(", ",response.keywords()));
		aiOutputRepository.save(keywordsOutput);
		AI_Output summaryOutput = new AI_Output();
        summaryOutput.setLecture(lecture);
        summaryOutput.setOutputType(OutputType.SUMMARY);
        summaryOutput.setOutputContent(response.summary());
        aiOutputRepository.save(summaryOutput);
        AI_Output pointsOutput = new AI_Output();
        pointsOutput.setLecture(lecture);
        pointsOutput.setOutputType(OutputType.IMPORTANT_POINTS);
        pointsOutput.setOutputContent(String.join("\n",response.importantPoints()));
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

    // Retrieve specific output type
    public AI_Output getOutputByType(Long lectureId, OutputType type) {
        return aiOutputRepository.findByLectureIdAndOutputType(lectureId, type);
    }
    public List<String> queryLecture(String question) {
        Map<String, Object> body = new HashMap<>();
        body.put("question", question);
        body.put("k", 3);

        Map<String, Object> response = restTemplate.postForObject(url + "/query", body, Map.class);

        List<Map<String, Object>> results =
            (List<Map<String, Object>>) response.get("results");

        return results.stream()
            .map(r -> (String) r.get("text"))
            .toList();
    }

}
