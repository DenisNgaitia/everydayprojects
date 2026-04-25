import '../models/transaction.dart';

class MpesaParser {
  /// Parses a standard M-Pesa SMS and extracts the transaction details.
  /// Example SMS:
  /// "PK12ABC345 Confirmed. Ksh450.00 paid to KIBANDA BAE. on 12/5/24 at 1:00 PM. New M-PESA balance is Ksh150.00."
  static Transaction? parseSms(String smsBody) {
    if (!smsBody.contains('Confirmed') && !smsBody.contains('received')) {
      return null;
    }

    try {
      // Regex to extract Receipt Number
      final receiptMatch = RegExp(r'^([A-Z0-9]+) Confirmed').firstMatch(smsBody);
      final receiptNumber = receiptMatch?.group(1) ?? 'UNKNOWN';

      // Regex to extract Amount
      final amountMatch = RegExp(r'Ksh([0-9,.]+)').firstMatch(smsBody);
      final amountStr = amountMatch?.group(1)?.replaceAll(',', '') ?? '0.0';
      final amount = double.parse(amountStr);

      // Determine Type (in/out)
      final isIncoming = smsBody.contains('received');
      final type = isIncoming ? 'in' : 'out';

      // Simple Category Logic (Local rules)
      String category = 'other';
      final lowerBody = smsBody.toLowerCase();
      if (lowerBody.contains('paid to') || lowerBody.contains('sent to')) {
         if (lowerBody.contains('kibanda') || lowerBody.contains('restaurant') || lowerBody.contains('food')) {
           category = 'food';
         } else if (lowerBody.contains('club') || lowerBody.contains('lounge') || lowerBody.contains('wines')) {
           category = 'vybe';
         } else {
           category = 'transfer';
         }
      }

      return Transaction(
        receiptNumber: receiptNumber,
        amount: amount,
        type: type,
        category: category,
        timestamp: DateTime.now(), // Real app would parse the SMS timestamp
      );
    } catch (e) {
      print('Error parsing M-Pesa SMS: $e');
      return null;
    }
  }
}
