package com.hereandnowai.spring_ai_chat;

import java.util.List;

// One quiz question: the options, which one is right (counting from 0), and why.
public record QuizQuestion(
        String question,
        List<String> options,
        int answerIndex,
        String explanation) {}
