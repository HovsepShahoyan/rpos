from PySide6 import QtGui
from PySide6.QtCore import Qt
from PySide6.QtGui import QPainter, QPen
from PySide6.QtWidgets import QGraphicsLineItem



class GraphicsLineItem(QGraphicsLineItem):

    def __init__(self, *args, **kwargs):
        super(GraphicsLineItem, self).__init__(*args, **kwargs)

    def paint(self, painter, option, widget):
        outline = QtGui.QPainterPath()
        outline.moveTo(self.line().p1())
        outline.lineTo(self.line().p2())

        painter.save()
        painter.setRenderHint(QPainter.Antialiasing)
        painter.strokePath(outline, QPen(Qt.black, 2 + self.pen().width()))
        painter.setPen(self.pen())
        painter.drawLine(self.line())
        painter.restore()
