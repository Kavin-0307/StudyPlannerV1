package com.Ajwain.SOS.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.Ajwain.SOS.entities.AI_Output;
import com.Ajwain.SOS.entities.enums.OutputType;

import io.lettuce.core.dynamic.annotation.Param;

@Repository
public interface AIOutputRepository extends JpaRepository<AI_Output,Long>{
	List<AI_Output> findByLectureId(long lectureId);
	@Query("SELECT a FROM AI_Output a WHERE a.lecture.id = :lectureId AND a.aiOutputType = :type")
	AI_Output findByLectureIdAndOutputType(
	    @Param("lectureId") Long lectureId,
	    @Param("type") OutputType type
	);

}
