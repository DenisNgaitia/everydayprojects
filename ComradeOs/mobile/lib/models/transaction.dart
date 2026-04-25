class Transaction {
  final String receiptNumber;
  final double amount;
  final String type; // 'in' or 'out'
  final String category;
  final DateTime timestamp;

  Transaction({
    required this.receiptNumber,
    required this.amount,
    required this.type,
    required this.category,
    required this.timestamp,
  });

  Map<String, dynamic> toJson() => {
    'mpesa_receipt': receiptNumber,
    'amount': amount,
    'type': type,
    'category': category,
    'timestamp': timestamp.toIso8601String(),
  };
}
