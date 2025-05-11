package com.sliit.model;


import jakarta.persistence.*;

/**
 * Entity representing the association between a user and a group.
 * Maps users to the groups they belong to.
 */

@Entity
@Table(name = "group_users")
public class GroupUser {

    /** Unique identifier for the group-user relationship */


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The group to which the user belongs */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private Group group;

    @Column(name = "user_id")
    private Long userId;

     /**
     * Default constructor.
     */

    public GroupUser() {}

    public GroupUser(Group group, Long userId) {
        this.group = group;
        this.userId = userId;
    }

    public Long getId() { return id; }
    public Group getGroup() { return group; }
    public void setGroup(Group group) { this.group = group; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}
