from unittest import TestCase
from pygodviz.iplasma import IPImporter
import os

class TestFileLoading(TestCase):
    def setUp(self):
        self.infile = 'dados.iPlasma.brutos.txt'
        self.outfile = 'test_output'

    def tearDown(self):
        if os.path.isfile(self.outfile):
            os.remove(self.outfile)

    def test_read_in_file(self):
        """
        Loads a file and check contents
        """
        importer = IPImporter.load(self.infile)
        self.assertIn('org.apache.struts2.components.URL', importer.in_content)
        self.assertIn(
                'org.apache.struts2.views.velocity.components.SubmitDirective',
                importer.in_content
        )
        self.assertEquals(411, len(importer.in_lines))

    def test_process_file(self):
        """
        Process and check the result
        """
        importer = IPImporter.load(self.infile)
        self.assertFalse(importer.result)
        importer.process()
        result = importer.result
        self.assertEquals(
                len(importer.in_lines),
                len(result)
        )
        classes = [item['name'] for item in result]
        self.assertIn('SubmitDirective', classes)
        namespaces = [item['namespace'] for item in result]
        self.assertIn(
                'org.apache.struts2.views.velocity.components.SubmitDirective',
                namespaces)

        importer.save_to(self.outfile, 'variable')
        self.assertTrue(os.path.isfile(self.outfile))
        content = open(self.outfile).read()
        self.assertIn('variable = ', content)
        self.assertIn('SubmitDirective', content)

    def test_process_line(self):
        """
        Process a sample line and check the result
        """
        sample_line = 'org.apache.struts2.views.jsp.ui.AbstractDoubleListTag    AbstractDoubleListTag   38  68  0   363 '
        result = IPImporter.process_line(sample_line)
        self.assertEquals(
                'org.apache.struts2.views.jsp.ui.AbstractDoubleListTag',
                result['namespace']
        )
        self.assertEquals(
                'AbstractDoubleListTag',
                result['name']
        )
        metrics = {
            "atfd": 38,
            "loc": 363.0,
            "tcc": 0.0,
            "wmc": 68
        }
        self.assertEquals(metrics, result['metrics'])

        sample_line = 'org.apache.struts2.components.ActionComponent    ActionComponent 1   31  0.02    223'
        result = IPImporter.process_line(sample_line)
        self.assertEquals(
                'org.apache.struts2.components.ActionComponent',
                result['namespace']
        )
        self.assertEquals('ActionComponent', result['name'])
        metrics = {
            "atfd": 1,
            "loc": 223.0,
            "tcc": 0.02,
            "wmc": 31
        }
        self.assertEquals(metrics, result['metrics'])





