package com.Ajwain.SOS.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.Ajwain.SOS.entities.AI_Output;
import com.Ajwain.SOS.entities.enums.OutputType;

@Repository
public interface AIOutputRepository extends JpaRepository<AI_Output,Long>{
	List<AI_Output> findByLectureId(long lectureId);

	AI_Output findByLectureIdAndOutputType(Long lectureId, OutputType type);
}
