import sys
from PySide6.QtWidgets import QApplication, QGraphicsView, QGraphicsScene, QGraphicsTextItem
from PySide6.QtGui import QColor, QFont, QPainter, QPainterPath, QPen
from PySide6.QtCore import Qt, QPointF


class OutlinedTextItem(QGraphicsTextItem):
    def __init__(self, text='', parent=None):
        super().__init__(text, parent)
        self.outline_color = QColor('black')
        self.text_color = QColor('green')
        self.outline_width = 4

    def setOutlineColor(self, color):
        self.outline_color = color

    def setTextColor(self, color):
        self.text_color = color
        self.setDefaultTextColor(color)

    def setOutlineWidth(self, width):
        self.outline_width = width

    def paint(self, painter, option, widget):
        painter.save()
        
        # Create a path for the text
        path = QPainterPath()
        path.addText(QPointF(0, 50), self.font(), self.toPlainText())

        # Draw the outline
        pen = QPen(self.outline_color, self.outline_width, Qt.SolidLine, Qt.RoundCap, Qt.RoundJoin)
        painter.setPen(pen)
        painter.setBrush(Qt.NoBrush)
        painter.drawPath(path)

        # Draw the main text
        painter.setPen(QPen(self.text_color, 5))
        painter.drawPath(path)
        
        painter.restore()


class GraphicsView(QGraphicsView):
    def __init__(self):
        super().__init__()
        self.setScene(QGraphicsScene(self))
        self.setRenderHint(QPainter.Antialiasing)

    def show_positioned_text(self, text_item: OutlinedTextItem, text, posX, posY, color=QColor(1, 225, 40), font=QFont("Arial", 36)):
        text_item.setPos(posX, posY)
        text_item.setFont(font)
        text_item.setPlainText(text)
        text_item.setTextColor(color)
        self.scene().addItem(text_item)


if __name__ == '__main__':
    app = QApplication(sys.argv)
    view = GraphicsView()
    view.setWindowTitle('Outlined Text Example')
    view.resize(800, 600)

    text_item = OutlinedTextItem()
    full_text = 'α<sub>դ.</sub>:' + str(123)
    view.show_positioned_text(text_item, full_text, 100, 100, QColor(255, 0, 0), QFont("Arial", 36))

    view.show()

    sys.exit(app.exec())
