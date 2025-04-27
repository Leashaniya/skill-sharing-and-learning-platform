package com.sliit.model;


import jakarta.persistence.*;


@Entity
@Table(name = "group_users")
public class GroupUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private Group group;

    @Column(name = "user_id")
    private Long userId;

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
