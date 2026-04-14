package com.Ajwain.SOS.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.Ajwain.SOS.entities.User;
@Repository
public interface UserRepository extends JpaRepository<User,Long> {
	Optional<User> findByUserEmail(String email);

	Optional<User> findByUserName(String name);
}
