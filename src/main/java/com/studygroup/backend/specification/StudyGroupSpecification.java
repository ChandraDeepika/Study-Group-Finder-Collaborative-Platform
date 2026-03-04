 package com.studygroup.backend.specification;

import com.studygroup.backend.model.StudyGroup;
import com.studygroup.backend.model.enums.GroupPrivacy;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

public class StudyGroupSpecification {

    public static Specification<StudyGroup> filter(
            String keyword,
            GroupPrivacy privacy,
            Long courseId,
            Integer minMembers
    ) {
        return (root, query, cb) -> {

            var predicates = cb.conjunction();

            if (keyword != null && !keyword.isBlank()) {
                var like = "%" + keyword.toLowerCase() + "%";
                predicates = cb.and(predicates,
                        cb.or(
                                cb.like(cb.lower(root.get("name")), like),
                                cb.like(cb.lower(root.get("description")), like)
                        )
                );
            }

            if (privacy != null) {
                predicates = cb.and(predicates,
                        cb.equal(root.get("privacy"), privacy));
            }

            if (courseId != null) {
                predicates = cb.and(predicates,
                        cb.equal(root.get("course").get("id"), courseId));
            }

            if (minMembers != null && minMembers > 0) {
                Join<Object, Object> members =
                        root.join("members", JoinType.LEFT);
                query.groupBy(root.get("id"));
                predicates = cb.and(predicates,
                        cb.ge(cb.count(members), minMembers));
            }

            return predicates;
        };
    }
}