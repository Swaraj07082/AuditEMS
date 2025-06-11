#!/usr/bin/env python3
"""
Ollama Diagnostic Script
Helps troubleshoot Ollama installation and model availability issues
"""

import ollama
import subprocess
import sys
import json
import requests
from typing import Dict, List, Any

def check_ollama_service():
    """Check if Ollama service is running"""
    print("🔍 Checking Ollama service status...")
    
    try:
        # Try to ping Ollama service
        response = requests.get("http://localhost:11434/api/version", timeout=5)
        if response.status_code == 200:
            version_info = response.json()
            print(f"✅ Ollama service is running (version: {version_info.get('version', 'unknown')})")
            return True
        else:
            print(f"❌ Ollama service responded with status: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Ollama service is not running or not accessible")
        return False
    except Exception as e:
        print(f"❌ Error checking Ollama service: {e}")
        return False

def check_ollama_installation():
    """Check if Ollama is installed"""
    print("\n🔍 Checking Ollama installation...")
    
    try:
        result = subprocess.run(['ollama', '--version'], capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            print(f"✅ Ollama is installed: {result.stdout.strip()}")
            return True
        else:
            print(f"❌ Ollama command failed: {result.stderr}")
            return False
    except FileNotFoundError:
        print("❌ Ollama is not installed or not in PATH")
        return False
    except subprocess.TimeoutExpired:
        print("❌ Ollama command timed out")
        return False
    except Exception as e:
        print(f"❌ Error checking Ollama installation: {e}")
        return False

def list_available_models():
    """List all available models"""
    print("\n🔍 Checking available models...")
    
    try:
        models = ollama.list()
        if models and 'models' in models:
            model_list = models['models']
            if model_list:
                print(f"✅ Found {len(model_list)} models:")
                for i, model in enumerate(model_list, 1):
                    name = model.get('name', 'Unknown')
                    size = model.get('size', 0)
                    size_gb = size / (1024**3) if size > 0 else 0
                    modified = model.get('modified_at', 'Unknown')
                    print(f"   {i}. {name} ({size_gb:.1f}GB) - Modified: {modified}")
                return model_list
            else:
                print("❌ No models found")
                return []
        else:
            print("❌ Unable to retrieve model list")
            return []
    except Exception as e:
        print(f"❌ Error listing models: {e}")
        return []

def test_model_connection(model_name: str = "llama3:8b"):
    """Test connection to a specific model"""
    print(f"\n🔍 Testing connection to model: {model_name}")
    
    try:
        response = ollama.generate(
            model=model_name,
            prompt="Hello, this is a test. Please respond with 'Connection successful'.",
            options={'num_predict': 10}
        )
        
        if response and 'response' in response:
            print(f"✅ Model {model_name} is working!")
            print(f"   Response: {response['response'][:100]}...")
            return True
        else:
            print(f"❌ Model {model_name} returned invalid response")
            return False
            
    except Exception as e:
        print(f"❌ Error testing model {model_name}: {e}")
        return False

def suggest_models_to_install():
    """Suggest which models to install"""
    print("\n💡 Recommended models for financial audit system:")
    
    recommended_models = [
        {
            'name': 'llama3:8b',
            'description': 'General purpose, good balance of performance and resource usage',
            'size': '~4.7GB',
            'command': 'ollama pull llama3:8b'
        },
        {
            'name': 'llama3.1:8b',
            'description': 'Latest version with improved capabilities',
            'size': '~4.7GB', 
            'command': 'ollama pull llama3.1:8b'
        },
        {
            'name': 'llama3.2:3b',
            'description': 'Smaller, faster model for basic tasks',
            'size': '~2GB',
            'command': 'ollama pull llama3.2:3b'
        }
    ]
    
    for model in recommended_models:
        print(f"   • {model['name']} ({model['size']})")
        print(f"     {model['description']}")
        print(f"     Install: {model['command']}")
        print()

def install_model(model_name: str):
    """Install a specific model"""
    print(f"\n🔧 Installing model: {model_name}")
    
    try:
        # Use ollama.pull() if available, otherwise use subprocess
        try:
            result = ollama.pull(model_name)
            print(f"✅ Model {model_name} installed successfully!")
            return True
        except AttributeError:
            # Fallback to subprocess
            result = subprocess.run(['ollama', 'pull', model_name], 
                                  capture_output=True, text=True, timeout=300)
            if result.returncode == 0:
                print(f"✅ Model {model_name} installed successfully!")
                return True
            else:
                print(f"❌ Installation failed: {result.stderr}")
                return False
                
    except subprocess.TimeoutExpired:
        print("❌ Installation timed out (this can happen with large models)")
        return False
    except Exception as e:
        print(f"❌ Error installing model: {e}")
        return False

def run_comprehensive_diagnostic():
    """Run comprehensive diagnostic"""
    print("🚀 Ollama Financial Audit System Diagnostic")
    print("=" * 50)
    
    # Check installation
    is_installed = check_ollama_installation()
    
    # Check service
    is_running = check_ollama_service() if is_installed else False
    
    # List models
    models = list_available_models() if is_running else []
    
    # Test model if available
    if models:
        # Try to find a suitable model
        suitable_models = ['llama3:8b', 'llama3:latest', 'llama3.1:8b', 'llama3.2:3b']
        model_names = [m['name'] for m in models]
        
        test_model = None
        for model in suitable_models:
            if model in model_names:
                test_model = model
                break
        
        if test_model:
            test_model_connection(test_model)
        else:
            print(f"\n⚠️  No suitable models found for testing")
            print(f"   Available: {model_names}")
    
    # Provide recommendations
    print("\n🎯 Diagnostic Summary:")
    print("-" * 30)
    
    if not is_installed:
        print("❌ Ollama is not installed")
        print("   Solution: Install Ollama from https://ollama.ai")
    elif not is_running:
        print("❌ Ollama service is not running")
        print("   Solution: Start Ollama service with 'ollama serve'")
    elif not models:
        print("❌ No models are installed")
        print("   Solution: Install a model (see recommendations below)")
        suggest_models_to_install()
    else:
        print("✅ Ollama is properly configured!")
        print(f"   {len(models)} models available")
    
    return {
        'installed': is_installed,
        'running': is_running,
        'models': models,
        'status': 'ready' if (is_installed and is_running and models) else 'needs_setup'
    }

def interactive_setup():
    """Interactive setup wizard"""
    print("\n🔧 Interactive Setup Wizard")
    print("-" * 30)
    
    diagnostic = run_comprehensive_diagnostic()
    
    if diagnostic['status'] == 'ready':
        print("\n✅ Your system is ready!")
        return True
    
    if not diagnostic['installed']:
        print("\n❌ Ollama needs to be installed first")
        print("   Please visit: https://ollama.ai")
        return False
    
    if not diagnostic['running']:
        print("\n❌ Ollama service needs to be started")
        print("   Run: ollama serve")
        return False
    
    if not diagnostic['models']:
        print("\n❌ No models installed")
        choice = input("Would you like to install llama3:8b? (y/n): ").lower()
        if choice == 'y':
            return install_model('llama3:8b')
    
    return False

if __name__ == "__main__":
    if len(sys.argv) > 1:
        if sys.argv[1] == '--setup':
            interactive_setup()
        elif sys.argv[1] == '--install' and len(sys.argv) > 2:
            install_model(sys.argv[2])
        else:
            print("Usage:")
            print("  python ollama_diagnostic.py           # Run diagnostic")
            print("  python ollama_diagnostic.py --setup   # Interactive setup")
            print("  python ollama_diagnostic.py --install <model>  # Install model")
    else:
        run_comprehensive_diagnostic()