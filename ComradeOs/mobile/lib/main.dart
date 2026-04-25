import 'package:flutter/material.dart';

void main() {
  runApp(const ComradeOSApp());
}

class ComradeOSApp extends StatelessWidget {
  const ComradeOSApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ComradeOS',
      theme: ThemeData(
        brightness: Brightness.dark,
        primarySwatch: Colors.green,
        scaffoldBackgroundColor: const Color(0xFF0F172A),
      ),
      home: const Scaffold(
        body: Center(
          child: Text(
            'ComradeOS Mobile Shell\nWaiting for Sync...',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.white, fontSize: 20),
          ),
        ),
      ),
    );
  }
}
