package com.Ajwain.SOS.storage;
import org.apache.tika.Tika;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.Ajwain.SOS.exception.BadRequestException;
import com.Ajwain.SOS.exception.ResourceNotFoundException;
import com.Ajwain.SOS.repositories.SubjectRepository;


@Service
public class FileStorageService {
	
	    private final SubjectRepository subjectRepository;
	    private final Path directoryPath;
	    private final Path lecturePath;

	    public FileStorageService(
	            SubjectRepository subjectRepository,
	            @Value("${storage.base-path:./sos_files}") String basePath) {
	        this.subjectRepository = subjectRepository;
	        this.directoryPath = Paths.get(basePath);
	        this.lecturePath = Paths.get(basePath, "lectures");
	        createDirectory();
	    }

	    private Path createDirectory() {
	        try {
	            Files.createDirectories(directoryPath);
	            Files.createDirectories(lecturePath);
	            Files.createDirectories(Paths.get(directoryPath.toString(), "temp"));
	            Files.createDirectories(Paths.get(directoryPath.toString(), "processed"));
	        } catch (IOException i) {
	            throw new RuntimeException("Unable to create the directory: " + i.getMessage());
	        }
	        return directoryPath;
	    }

	  

	public Path saveUploadedFile(MultipartFile file,long subjectId) throws IOException {
			Tika tika=new Tika();
			String detectedType="";
			
			detectedType = tika.detect(file.getInputStream());
			
			
			if("application/pdf".equals(detectedType))
			{
				System.out.println("Valid file");
		
			}
			else
			{
				
				throw new BadRequestException("Invalid file type");
			}
			Path subjectDirectory=createSubjectDirectory(subjectId);
			String newFilename = UUID.randomUUID().toString() + ".pdf";
			Path targetLocation = subjectDirectory.resolve(newFilename);
			Files.copy(file.getInputStream(),targetLocation ,StandardCopyOption.REPLACE_EXISTING);
			return targetLocation;
			
	}
	public Path saveFileFromPath(String existingPath, long subjectId) throws IOException {
	    Path path = Paths.get(existingPath);
	    File file = path.toFile();

	    if (!Files.exists(path) || !file.isFile()) {
	        throw new ResourceNotFoundException("No file found at location: " + existingPath);
	    }

	    Tika tika = new Tika();
	    String detectedType = tika.detect(file);

	    if (!"application/pdf".equals(detectedType)) {
	        throw new BadRequestException("File at path is not a valid PDF");
	    }

	    Path subjectDirectory = createSubjectDirectory(subjectId);
	    String uniqueFilename = UUID.randomUUID().toString() + "_" + file.getName();
	    Path targetPath = subjectDirectory.resolve(uniqueFilename);

	    Files.copy(path, targetPath, StandardCopyOption.REPLACE_EXISTING);
	    return targetPath;
	}
	public Path loadFile(String path) {
		Path p1=Paths.get(path);
		if(!Files.exists(p1)) {
			throw new ResourceNotFoundException("File not found");
		}
		return p1;
		
	}
	public void deleteFile(String filePath) {
		
			Path path=Paths.get(filePath);
			try{
				Files.deleteIfExists(path);
			}
			catch(IOException i) {
				throw new ResourceNotFoundException("File not found at " + filePath);
			}
		
	}
	public Path moveToProcessed(Path filePath) throws IOException {
	    Path processedDir = directoryPath.resolve("processed");
	    Files.createDirectories(processedDir);

	    String uniqueName=UUID.randomUUID().toString() + "_" + filePath.getFileName();
	    Path target=processedDir.resolve(uniqueName);

	    Files.move(filePath, target, StandardCopyOption.REPLACE_EXISTING);
	    return target;
	}
	public long getFileSize(String filePath) throws IOException{
		return Files.size(Paths.get(filePath));
	}
	public String getFileName(String filePath) {
		return Paths.get(filePath).getFileName().toString();
	}
	private Path createSubjectDirectory(long subjectId)throws IOException {
		subjectRepository.findById(subjectId).orElseThrow(()->new ResourceNotFoundException("Subject Not Found"));
		Path subjectDirectory=directoryPath.resolve("lectures").resolve("subject_"+subjectId);
		if(Files.isDirectory((subjectDirectory)))
				System.out.println("Subject directory already exists");
		else
		{
			Files.createDirectories(subjectDirectory);
		}
		return subjectDirectory;
	}
} 
