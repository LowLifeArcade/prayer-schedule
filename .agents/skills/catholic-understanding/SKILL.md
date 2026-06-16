---
name: catholic-understanding
description: Catholic theological context for prayer, devotion, liturgy, saints, sacraments, feast days, Scripture use, religious copy, and app behavior in prayer-focused projects. Use when Codex works on prayer schedules, Catholic devotional content, liturgical calendars, saint or feast descriptions, sacramental language, theological explanations, user-facing prayer UX, or any feature where the meaning of prayer should be interpreted from Catholic theology rather than generic spirituality.
---

# Catholic Understanding

## Overview

Assume prayer-related work is Catholic unless the user explicitly says otherwise. Shape explanations, content, labels, and product decisions around Catholic theology, Catholic devotional practice, and the Church's liturgical life.

## Core Frame

- Treat prayer as communion with God, participation in grace, and a response to God's initiative, not only mindfulness, self-expression, habit tracking, or wellness.
- Keep Jesus Christ, the Trinity, the Church, Scripture, sacraments, liturgy, saints, and the communion of saints as normal context for prayer.
- Distinguish worship due to God from veneration of saints and honor given to Mary. Do not describe Catholics as worshiping Mary or the saints.
- Treat the Eucharist, Mass, Liturgy of the Hours, sacraments, liturgical seasons, feast days, and solemnities as objective ecclesial realities, not merely inspirational themes.
- Use reverent, precise language for sacred topics. Avoid flippant copy, purely therapeutic framing, or language that reduces prayer to productivity.

## Content Guidance

- Prefer Catholic source categories when accuracy matters: the Catechism of the Catholic Church, Scripture in Catholic context, the Roman Missal, the Liturgy of the Hours, canon law where relevant, Vatican documents, diocesan guidance, and official liturgical calendars.
- Verify current dates, feast ranks, local calendars, holy days of obligation, translations, indulgence norms, and rubrics when they affect behavior or user-facing claims.
- Separate universal Catholic teaching from local custom, private devotion, pastoral advice, and app preference.
- Flag uncertainty instead of inventing doctrine, quotations, feast ranks, or prayer texts.
- Do not present disputed theological opinions, private revelation, or popular devotions as binding doctrine.
- Respect copyright and licensing for modern prayer translations, liturgical texts, Bible translations, and hymns. Use public-domain texts or properly licensed sources when generating app content.

## Product Decisions

- Design prayer flows as aids to fidelity, recollection, and participation in Catholic life. Avoid gamifying prayer in ways that imply grace is earned by streaks or metrics.
- When tracking or scheduling prayer, frame reminders as gentle supports rather than moral scoring.
- Account for liturgical time: Sundays, solemnities, memorials, feasts, seasons, vigils, octaves, fasting/abstinence days, and local calendars may matter.
- Use labels that Catholics recognize: Mass, Liturgy of the Hours, Rosary, Divine Mercy Chaplet, novena, examen, lectio divina, intentions, intercession, feast, solemnity, memorial, ordinary time, Advent, Christmas, Lent, Easter.
- If supporting multiple Christian traditions or religions, make the Catholic context explicit and do not flatten distinct practices into generic prayer categories.

## Implementation Habits

- Before changing prayer or calendar logic, identify whether the feature depends on doctrine, liturgical law, local calendar data, or ordinary product behavior.
- Encode theological distinctions in names when helpful: `intercession` is different from `worship`; `memorial` is different from `solemnity`; `devotion` is different from `sacrament`.
- Keep generated examples pastorally careful and suitable for a Catholic audience.
- When asked for a neutral or interfaith treatment, preserve Catholic accuracy while adapting tone and scope to the user's request.
