"""
Custom Ratios Storage Service
Handles persistence of user-created custom financial ratios
"""

import json
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from datetime import datetime


class CustomRatiosStorage:
    """Service for storing and retrieving custom ratios"""
    
    def __init__(self, storage_dir: Optional[str] = None):
        """
        Initialize storage service
        
        Args:
            storage_dir: Directory for storing custom ratios (default: ./data/custom_ratios)
        """
        if storage_dir:
            self.storage_dir = Path(storage_dir)
        else:
            # Default to data/custom_ratios in backend directory
            self.storage_dir = Path(__file__).parent.parent.parent / "data" / "custom_ratios"
        
        # Create directory if it doesn't exist
        self.storage_dir.mkdir(parents=True, exist_ok=True)
    
    def _get_user_file_path(self, user_id: str = "default") -> Path:
        """
        Get file path for user's custom ratios
        
        Args:
            user_id: User identifier (default: "default" for single-user setup)
        
        Returns:
            Path to user's custom ratios file
        """
        return self.storage_dir / f"{user_id}_ratios.json"
    
    def save_custom_ratios(self, custom_ratios: List[Dict], user_id: str = "default") -> Tuple[bool, Optional[str]]:
        """
        Save custom ratios to storage
        
        Args:
            custom_ratios: List of custom ratio dictionaries
            user_id: User identifier
        
        Returns:
            Tuple of (success, error_message)
        """
        try:
            file_path = self._get_user_file_path(user_id)
            
            # Add metadata
            data = {
                "ratios": custom_ratios,
                "metadata": {
                    "user_id": user_id,
                    "last_updated": datetime.now().isoformat(),
                    "count": len(custom_ratios)
                }
            }
            
            # Write to file with pretty formatting
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            return True, None
            
        except Exception as e:
            return False, f"Failed to save custom ratios: {str(e)}"
    
    def load_custom_ratios(self, user_id: str = "default") -> Tuple[Optional[List[Dict]], Optional[str]]:
        """
        Load custom ratios from storage
        
        Args:
            user_id: User identifier
        
        Returns:
            Tuple of (custom_ratios_list, error_message)
        """
        try:
            file_path = self._get_user_file_path(user_id)
            
            # Check if file exists
            if not file_path.exists():
                return [], None  # No saved ratios yet, return empty list
            
            # Read from file
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Extract ratios
            ratios = data.get('ratios', [])
            
            return ratios, None
            
        except json.JSONDecodeError as e:
            return None, f"Invalid JSON in custom ratios file: {str(e)}"
        except Exception as e:
            return None, f"Failed to load custom ratios: {str(e)}"
    
    def add_custom_ratio(self, ratio: Dict, user_id: str = "default") -> Tuple[bool, Optional[str]]:
        """
        Add a single custom ratio to storage
        
        Args:
            ratio: Custom ratio dictionary
            user_id: User identifier
        
        Returns:
            Tuple of (success, error_message)
        """
        try:
            # Load existing ratios
            existing_ratios, error = self.load_custom_ratios(user_id)
            if error:
                return False, error
            
            if existing_ratios is None:
                existing_ratios = []
            
            # Add new ratio
            existing_ratios.append(ratio)
            
            # Save updated list
            return self.save_custom_ratios(existing_ratios, user_id)
            
        except Exception as e:
            return False, f"Failed to add custom ratio: {str(e)}"
    
    def update_custom_ratio(self, ratio_id: str, updated_ratio: Dict, user_id: str = "default") -> Tuple[bool, Optional[str]]:
        """
        Update an existing custom ratio
        
        Args:
            ratio_id: ID of ratio to update
            updated_ratio: Updated ratio dictionary
            user_id: User identifier
        
        Returns:
            Tuple of (success, error_message)
        """
        try:
            # Load existing ratios
            existing_ratios, error = self.load_custom_ratios(user_id)
            if error:
                return False, error
            
            if existing_ratios is None:
                return False, "No existing ratios found"
            
            # Find and update ratio
            found = False
            for i, ratio in enumerate(existing_ratios):
                if ratio.get('id') == ratio_id or ratio.get('name') == ratio_id:
                    existing_ratios[i] = updated_ratio
                    found = True
                    break
            
            if not found:
                return False, f"Ratio with ID '{ratio_id}' not found"
            
            # Save updated list
            return self.save_custom_ratios(existing_ratios, user_id)
            
        except Exception as e:
            return False, f"Failed to update custom ratio: {str(e)}"
    
    def delete_custom_ratio(self, ratio_id: str, user_id: str = "default") -> Tuple[bool, Optional[str]]:
        """
        Delete a custom ratio from storage
        
        Args:
            ratio_id: ID of ratio to delete
            user_id: User identifier
        
        Returns:
            Tuple of (success, error_message)
        """
        try:
            # Load existing ratios
            existing_ratios, error = self.load_custom_ratios(user_id)
            if error:
                return False, error
            
            if existing_ratios is None:
                return False, "No existing ratios found"
            
            # Filter out the ratio to delete
            original_count = len(existing_ratios)
            existing_ratios = [
                r for r in existing_ratios 
                if r.get('id') != ratio_id and r.get('name') != ratio_id
            ]
            
            if len(existing_ratios) == original_count:
                return False, f"Ratio with ID '{ratio_id}' not found"
            
            # Save updated list
            return self.save_custom_ratios(existing_ratios, user_id)
            
        except Exception as e:
            return False, f"Failed to delete custom ratio: {str(e)}"
    
    def clear_all_custom_ratios(self, user_id: str = "default") -> Tuple[bool, Optional[str]]:
        """
        Delete all custom ratios for a user
        
        Args:
            user_id: User identifier
        
        Returns:
            Tuple of (success, error_message)
        """
        try:
            file_path = self._get_user_file_path(user_id)
            
            if file_path.exists():
                file_path.unlink()
            
            return True, None
            
        except Exception as e:
            return False, f"Failed to clear custom ratios: {str(e)}"
    
    def export_custom_ratios(self, user_id: str = "default") -> Tuple[Optional[str], Optional[str]]:
        """
        Export custom ratios as JSON string
        
        Args:
            user_id: User identifier
        
        Returns:
            Tuple of (json_string, error_message)
        """
        try:
            ratios, error = self.load_custom_ratios(user_id)
            if error:
                return None, error
            
            if ratios is None:
                ratios = []
            
            json_str = json.dumps(ratios, indent=2, ensure_ascii=False)
            return json_str, None
            
        except Exception as e:
            return None, f"Failed to export custom ratios: {str(e)}"
    
    def import_custom_ratios(self, json_string: str, user_id: str = "default", merge: bool = False) -> Tuple[bool, Optional[str]]:
        """
        Import custom ratios from JSON string
        
        Args:
            json_string: JSON string containing ratios
            user_id: User identifier
            merge: If True, merge with existing ratios; if False, replace
        
        Returns:
            Tuple of (success, error_message)
        """
        try:
            # Parse JSON
            imported_ratios = json.loads(json_string)
            
            if not isinstance(imported_ratios, list):
                return False, "Imported data must be a list of ratios"
            
            if merge:
                # Load existing and merge
                existing_ratios, error = self.load_custom_ratios(user_id)
                if error:
                    return False, error
                
                if existing_ratios is None:
                    existing_ratios = []
                
                # Merge without duplicates (based on name)
                existing_names = {r.get('name') for r in existing_ratios if r.get('name')}
                for ratio in imported_ratios:
                    if ratio.get('name') not in existing_names:
                        existing_ratios.append(ratio)
                
                return self.save_custom_ratios(existing_ratios, user_id)
            else:
                # Replace existing
                return self.save_custom_ratios(imported_ratios, user_id)
            
        except json.JSONDecodeError as e:
            return False, f"Invalid JSON format: {str(e)}"
        except Exception as e:
            return False, f"Failed to import custom ratios: {str(e)}"


# Global instance
custom_ratios_storage = CustomRatiosStorage()
