package com.sliit.repository;

import com.sliit.model.Notification;
import com.sliit.model.User;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> { 
    List<Notification> findByTo(User to);
 }
