# M-Pesa Pochi La Biashara Integration Guide

This POS system has been customized to automatically verify M-Pesa **Pochi La Biashara** payments via SmsForwarder.

## Prerequisites
1. An Android phone with the Safaricom SIM card receiving your Pochi La Biashara payments.
2. The phone must have an active, reliable internet connection (Wi-Fi or Mobile Data).
3. The **SmsForwarder** app installed on the phone (download from F-Droid or GitHub).

## Configuration Steps

### 1. Database Setup
Ensure you have updated your database to support Pochi La Biashara. You can do this by opening `yourdomain.com/update_plb.php` in your browser once. This adds the necessary `customer_phone` fields to your tables.

### 2. Configure SmsForwarder on the Phone

- **Permissions**: Grant SmsForwarder permissions to read SMS.
- **Battery Optimization**: Open your Android phone settings, find SmsForwarder, and **disable battery optimization**. Ensure the app is set to "Auto-start" so it runs continuously in the background without being killed by the phone.

#### Create a Webhook Sender
1. Go to **Senders** -> Add **Webhook**.
2. **Name**: `POS Webhook`
3. **Webhook URL**: `https://yourdomain.com/api/mpesa-callback.php` (Replace with your actual live URL)
4. **Method**: `POST`
5. **WebParams / Body**: Choose `JSON` format. You must configure exactly two parameters to be sent:
   - Key: `token` | Value: `mpesa_secret_token_123` (or whatever is in your `config/token.php`)
   - Key: `sms_content` | Value: `[msg]` (Use the exact tag `[msg]` so SmsForwarder injects the SMS text here).

#### Create a Forwarding Rule
1. Go to **Rules** -> Add Rule.
2. **Rule Name**: `Pochi La Biashara`
3. **Match condition**: Choose "Contains keywords".
4. **Keywords**: Enter `Pochi La Biashara`
5. **Sender**: Select the `POS Webhook` sender you created above.
6. **SIM Slot**: Choose the specific SIM slot if you have a dual-SIM phone.
7. Save the rule.

## How It Works in the POS
1. The cashier selects "Mobile Money" during checkout.
2. (Optional) The cashier asks the customer for their M-Pesa number (e.g., `0712345678`) and enters it in the POS. This guarantees a perfect 100% match.
3. The cashier clicks Confirm, and the POS enters a "Waiting for M-Pesa..." state.
4. The customer sends money to your Pochi La Biashara number.
5. Safaricom sends the confirmation SMS to your phone.
6. SmsForwarder instantly pushes that SMS to the POS backend.
7. The system parses the amount, sender phone, and transaction code. It strictly matches the amount, and if the cashier entered the customer's phone number, it matches that exactly too.
8. The POS automatically approves the sale and prints the receipt.

## Manual Fallback
If the internet cuts out on the phone or the automatic matching fails, the POS provides a **"Manual Override"**. The cashier can manually enter the transaction code (e.g., `QGK7X5FGH2`) from the customer's SMS message to force the approval.
