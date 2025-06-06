package com.sliit.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.sliit.model.Twit;
import com.sliit.model.User;

public interface TwitRepository extends JpaRepository<Twit, Long> {

	List<Twit> findAllByIsTwitTrueOrderByCreatedAtDesc();
	List<Twit> findByRetwitUserContainsOrUser_IdAndIsTwitTrueOrderByCreatedAtDesc(User user, Long userId);
	List<Twit> findByLikesContainingOrderByCreatedAtDesc(User user);
	
	@Query("SELECT t FROM Twit t JOIN t.likes l WHERE l.user.id = :userId")
	List<Twit> findByLikesUser_Id(Long userId);
	
	@Query("SELECT t.images FROM Twit t WHERE t.id = :twitId")
	List<String> findImagesByTwitId(@Param("twitId") Long twitId);
	
	@Modifying
	@Query(value = "INSERT INTO twit_images (twit_id, images) VALUES (:twitId, :image)", nativeQuery = true)
	void addTwitImage(@Param("twitId") Long twitId, @Param("image") String image);
	
	@Modifying
	@Query(value = "DELETE FROM twit_images WHERE twit_id = :twitId", nativeQuery = true)
	void deleteAllTwitImages(@Param("twitId") Long twitId);

	@Query("SELECT t FROM Twit t WHERE (t.user = :viewer OR t.user IN :followedUsers) AND t.isTwit = true ORDER BY t.createdAt DESC")
	List<Twit> findVisiblePosts(@Param("viewer") User viewer, @Param("followedUsers") List<User> followedUsers);

//    @Query("SELECT t FROM Twit t JOIN t.likes l WHERE l.user.id = :userId")
//    List<Twit> findTwitsByUserIdInLikes(Long userId);

}
