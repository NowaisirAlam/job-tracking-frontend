import importlib.util
from pathlib import Path
import unittest


class UITestCase(unittest.TestCase):
    def test_ui_module_file_exists(self):
        self.assertTrue(Path("UI.py").is_file())

    def test_ui_module_can_be_loaded(self):
        spec = importlib.util.spec_from_file_location("UI", "UI.py")
        self.assertIsNotNone(spec)
        self.assertIsNotNone(spec.loader)

        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)


if __name__ == "__main__":
    unittest.main()
