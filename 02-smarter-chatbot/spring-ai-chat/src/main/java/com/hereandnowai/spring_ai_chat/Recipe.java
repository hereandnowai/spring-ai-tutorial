package com.hereandnowai.spring_ai_chat;

import java.util.List;

// The shape we want the AI's answer in. Spring AI fills it in for us.
public record Recipe(String name, List<String> ingredients, int minutes) {}
