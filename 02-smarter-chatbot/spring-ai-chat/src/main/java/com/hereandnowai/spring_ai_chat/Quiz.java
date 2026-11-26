package com.hereandnowai.spring_ai_chat;

import java.util.List;

// A whole quiz: its topic and a list of questions. Spring AI fills it in for us.
public record Quiz(String topic, List<QuizQuestion> questions) {}
