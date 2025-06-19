// app/loginStyles.ts
import { StyleSheet } from 'react-native';

const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121c2c',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 36,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 1,
  },
  label: {
    color: '#c0c6d4',
    fontSize: 16,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    borderWidth: 0,
    marginBottom: 18,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#222c3c',
    color: '#fff',
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 4,
    elevation: 4,
  },
  button: {
    backgroundColor: '#1f77d2',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1.1,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1f77d2',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 0,
  },
  secondaryButtonText: {
    color: '#1f77d2',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  }
});

export default loginStyles;