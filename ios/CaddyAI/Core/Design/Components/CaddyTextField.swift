import SwiftUI

struct CaddyTextField: View {
    let placeholder: String
    @Binding var text: String
    var icon: String? = nil
    var isSecure: Bool = false
    var keyboardType: UIKeyboardType = .default

    @FocusState private var isFocused: Bool

    var body: some View {
        HStack(spacing: 12) {
            if let icon = icon {
                Image(systemName: icon)
                    .foregroundColor(isFocused ? .forest : .gray400)
                    .font(.system(size: 16))
            }

            if isSecure {
                SecureField(placeholder, text: $text)
                    .focused($isFocused)
            } else {
                TextField(placeholder, text: $text)
                    .keyboardType(keyboardType)
                    .focused($isFocused)
            }
        }
        .font(.bodyMedium)
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
        .background(Color.white)
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(
                    isFocused ? Color.forest : Color.gray300,
                    lineWidth: isFocused ? 2 : 1
                )
        )
    }
}

// MARK: - Text Area
struct CaddyTextArea: View {
    let placeholder: String
    @Binding var text: String
    var minHeight: CGFloat = 100

    @FocusState private var isFocused: Bool

    var body: some View {
        ZStack(alignment: .topLeading) {
            if text.isEmpty {
                Text(placeholder)
                    .font(.bodyMedium)
                    .foregroundColor(.gray400)
                    .padding(.horizontal, 4)
                    .padding(.vertical, 8)
            }

            TextEditor(text: $text)
                .font(.bodyMedium)
                .focused($isFocused)
                .scrollContentBackground(.hidden)
                .background(.clear)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .frame(minHeight: minHeight, alignment: .topLeading)
        .background(Color.white)
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(
                    isFocused ? Color.forest : Color.gray300,
                    lineWidth: isFocused ? 2 : 1
                )
        )
    }
}

// MARK: - Currency Input
struct CaddyCurrencyField: View {
    let placeholder: String
    @Binding var value: Double?

    @State private var textValue: String = ""
    @FocusState private var isFocused: Bool

    var body: some View {
        HStack(spacing: 8) {
            Text("$")
                .font(.bodyLarge)
                .foregroundColor(.gray500)

            TextField(placeholder, text: $textValue)
                .keyboardType(.decimalPad)
                .focused($isFocused)
                .font(.bodyMedium)
                .onChange(of: textValue) { _, newValue in
                    if let doubleValue = Double(newValue) {
                        value = doubleValue
                    } else if newValue.isEmpty {
                        value = nil
                    }
                }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
        .background(Color.white)
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(
                    isFocused ? Color.forest : Color.gray300,
                    lineWidth: isFocused ? 2 : 1
                )
        )
        .onAppear {
            if let value = value {
                textValue = String(format: "%.2f", value)
            }
        }
    }
}

#Preview {
    VStack(spacing: 16) {
        CaddyTextField(
            placeholder: "Enter your email",
            text: .constant(""),
            icon: "envelope"
        )

        CaddyTextField(
            placeholder: "Password",
            text: .constant(""),
            icon: "lock",
            isSecure: true
        )

        CaddyCurrencyField(
            placeholder: "0.00",
            value: .constant(500.0)
        )

        CaddyTextArea(
            placeholder: "Enter description...",
            text: .constant("")
        )
    }
    .padding()
    .background(Color.gray50)
}
