import { StyleSheet, Platform } from 'react-native';

const planifierStyles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#0e1524aa',
    paddingTop: Platform.OS === 'ios' ? 54 : 32,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 1,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  label: {
    color: '#ccc',
    marginBottom: 6,
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#1a2335',
    color: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#273a5a',
  },
  picker: {
    backgroundColor: '#1a2335',
    color: '#fff',
    borderRadius: 10,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#273a5a',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#27ae60',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});

export default planifierStyles;